#!/usr/bin/env python3
"""
ClearAMS authentication server.

Start:
    python3 server.py

Admin key defaults to a random value printed on startup.
Override with:
    ADMIN_KEY=mysecret python3 server.py
"""
import bcrypt
import json
import os
import secrets
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder=".")

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
USERS_FILE  = os.path.join(BASE_DIR, "users.json")
ADMIN_KEY   = os.environ.get("ADMIN_KEY") or secrets.token_hex(16)

# In-process session store  {token: email}
_sessions: dict[str, str] = {}


# ── Persistence helpers ────────────────────────────────────────────────────────

def load_users() -> dict:
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE) as f:
        return json.load(f)


def save_users(users: dict) -> None:
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


# ── Auth decorators ────────────────────────────────────────────────────────────

def _token_from_request() -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return request.cookies.get("session")


def _school_ids(user: dict) -> list:
    """Return schoolIds list, falling back to legacy schoolId field."""
    if user.get("schoolIds"):
        return user["schoolIds"]
    if user.get("schoolId"):
        return [user["schoolId"]]
    return []


def require_session(f):
    @wraps(f)
    def inner(*args, **kwargs):
        token = _token_from_request()
        email = _sessions.get(token) if token else None
        if not email:
            return jsonify({"error": "Unauthorized"}), 401
        users = load_users()
        if email not in users:
            return jsonify({"error": "User not found"}), 401
        return f(email, users[email], *args, **kwargs)
    return inner


def require_admin(f):
    @wraps(f)
    def inner(*args, **kwargs):
        key = request.headers.get("X-Admin-Key") or request.args.get("key", "")
        if key != ADMIN_KEY:
            return jsonify({"error": "Forbidden"}), 403
        return f(*args, **kwargs)
    return inner


# ── User API ───────────────────────────────────────────────────────────────────

@app.route("/api/login", methods=["POST"])
def api_login():
    data     = request.json or {}
    email    = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").encode()

    users = load_users()
    user  = users.get(email)
    if not user or not bcrypt.checkpw(password, user["passwordHash"].encode()):
        return jsonify({"error": "Invalid email or password."}), 401

    token = secrets.token_hex(32)
    _sessions[token] = email

    resp = jsonify({
        "token":            token,
        "email":            email,
        "schoolIds":        _school_ids(user),
        "mustResetPassword": user.get("mustResetPassword", False),
    })
    resp.set_cookie("session", token, httponly=True, samesite="Strict")
    return resp


@app.route("/api/me", methods=["GET"])
@require_session
def api_me(email, user):
    return jsonify({
        "email":            email,
        "schoolIds":        _school_ids(user),
        "mustResetPassword": user.get("mustResetPassword", False),
    })


@app.route("/api/change-password", methods=["POST"])
@require_session
def api_change_password(email, user):
    data        = request.json or {}
    new_pw      = (data.get("newPassword") or "")
    confirm_pw  = (data.get("confirmPassword") or "")

    if len(new_pw) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400
    if new_pw != confirm_pw:
        return jsonify({"error": "Passwords do not match."}), 400

    users = load_users()
    users[email]["passwordHash"]      = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt()).decode()
    users[email]["mustResetPassword"] = False
    save_users(users)
    return jsonify({"ok": True})


@app.route("/api/logout", methods=["POST"])
def api_logout():
    token = _token_from_request()
    if token:
        _sessions.pop(token, None)
    resp = jsonify({"ok": True})
    resp.delete_cookie("session")
    return resp


# ── Admin API ──────────────────────────────────────────────────────────────────

@app.route("/admin/api/users", methods=["GET"])
@require_admin
def admin_list_users():
    users = load_users()
    return jsonify([
        {
            "email":            e,
            "schoolIds":        _school_ids(u),
            "mustResetPassword": u.get("mustResetPassword", False),
        }
        for e, u in sorted(users.items())
    ])


@app.route("/admin/api/user", methods=["POST"])
@require_admin
def admin_add_user():
    data       = request.json or {}
    email      = (data.get("email") or "").strip().lower()
    password   = (data.get("password") or "")
    school_ids = data.get("schoolIds") or []
    if not school_ids and data.get("schoolId"):
        school_ids = [data["schoolId"].strip()]

    if not email or not password or not school_ids:
        return jsonify({"error": "email, password, and at least one school are required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Initial password must be at least 6 characters."}), 400

    users = load_users()
    users[email] = {
        "passwordHash":      bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode(),
        "schoolIds":         school_ids,
        "mustResetPassword": True,
    }
    save_users(users)
    return jsonify({"ok": True, "email": email})


@app.route("/admin/api/reset", methods=["POST"])
@require_admin
def admin_reset_password():
    data     = request.json or {}
    email    = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "")

    if not email or not password:
        return jsonify({"error": "email and password are required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    users = load_users()
    if email not in users:
        return jsonify({"error": "User not found."}), 404

    users[email]["passwordHash"]      = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    users[email]["mustResetPassword"] = True
    save_users(users)
    return jsonify({"ok": True})


@app.route("/admin/api/user/<path:email>", methods=["DELETE"])
@require_admin
def admin_delete_user(email):
    email = email.strip().lower()
    users = load_users()
    if email not in users:
        return jsonify({"error": "User not found."}), 404
    del users[email]
    save_users(users)
    return jsonify({"ok": True})


# ── Static files ───────────────────────────────────────────────────────────────

PLAYER_DIR = os.path.join(BASE_DIR, "remotion-viz", "dist")

@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "ClearAMS Dashboard.html")


@app.route("/admin")
def admin_panel():
    return send_from_directory(BASE_DIR, "admin.html")


@app.route("/player")
@app.route("/player/")
def player_page():
    return send_from_directory(PLAYER_DIR, "player.html")


@app.route("/player/<path:filename>")
def player_static(filename):
    return send_from_directory(PLAYER_DIR, filename)


@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(BASE_DIR, filename)


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if not os.path.exists(USERS_FILE):
        save_users({})

    print("=" * 60)
    print("  ClearAMS Server")
    print(f"  Dashboard : http://localhost:8080/")
    print(f"  Admin     : http://localhost:8080/admin")
    print(f"  Admin key : {ADMIN_KEY}")
    print("=" * 60)

    app.run(host="0.0.0.0", port=8080, debug=False)
