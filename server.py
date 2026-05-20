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
import smtplib
import ssl
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder=".")

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
DATA_DIR    = os.environ.get("DATA_DIR", BASE_DIR)
USERS_FILE  = os.path.join(DATA_DIR, "users.json")
PLANS_FILE  = os.path.join(DATA_DIR, "plans.json")
ADMIN_KEY   = os.environ.get("ADMIN_KEY") or secrets.token_hex(16)

SMTP_HOST     = os.environ.get("SMTP_HOST", "")
SMTP_PORT     = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER     = os.environ.get("SMTP_USER", "")
SMTP_PASS     = os.environ.get("SMTP_PASS", "")
SMTP_FROM     = os.environ.get("SMTP_FROM", "") or SMTP_USER
APP_URL       = os.environ.get("APP_URL", "https://clearams.gusddev.app")
EMAIL_ENABLED = bool(SMTP_HOST and SMTP_USER and SMTP_PASS)

_SCHOOL_NAMES = {
    "hoover":"Hoover HS","crescenta":"CVHS","glendale":"Glendale HS",
    "clark":"Clark HS","daily":"Daily HS","roosevelt":"Roosevelt MS",
    "rosemont":"Rosemont MS","toll":"Toll MS","wilson":"Wilson MS",
    "balboa":"Balboa ES","cerritos":"Cerritos ES","columbus":"Columbus ES",
    "dunsmore":"Dunsmore ES","edison":"Edison ES","franklin":"Franklin ES",
    "fremont":"Fremont ES","glenoaks":"Glenoaks ES","jefferson":"Jefferson ES",
    "keppel":"Keppel ES","lacrescenta":"La Crescenta ES","lincoln":"Lincoln ES",
    "mann":"Horace Mann ES","marshall":"Marshall ES","montevista":"Monte Vista ES",
    "mountainave":"Mountain Ave ES","muir":"Muir ES","valleyview":"Valley View ES",
    "verdugowoodlands":"Verdugo Woodlands ES","rdwhite":"R.D. White ES",
    "cloud":"Cloud Preschool","verdugoacademy":"Verdugo Academy",
    "jewelcity":"Jewel City","pacificave":"Pacific Avenue Education Center",
}


def send_welcome_email(to_email: str, password: str, school_ids: list) -> None:
    schools = ", ".join(_SCHOOL_NAMES.get(s, s) for s in school_ids) or "your school"
    subject = "Your ClearAMS account is ready — GUSD VAPA"
    body = (
        f"Hi,\n\n"
        f"Your ClearAMS account has been created for {schools}.\n\n"
        f"ClearAMS is the Prop 28 / VAPA budget dashboard for Glendale Unified schools.\n\n"
        f"  Login:    {APP_URL}\n"
        f"  Email:    {to_email}\n"
        f"  Password: {password}\n\n"
        f"You will be prompted to set your own password on first login.\n\n"
        f"Questions? Contact Dr. Emil Ahangarzadeh at eahangarzadeh@gusd.net\n\n"
        f"— GUSD VAPA Team\n"
    )
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = SMTP_FROM
    msg["To"]      = to_email
    msg.attach(MIMEText(body, "plain"))

    ctx = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
        s.ehlo()
        s.starttls(context=ctx)
        s.login(SMTP_USER, SMTP_PASS)
        s.sendmail(SMTP_FROM, to_email, msg.as_string())

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


def load_plans() -> dict:
    if not os.path.exists(PLANS_FILE):
        return {}
    with open(PLANS_FILE) as f:
        return json.load(f)


def save_plans(plans: dict) -> None:
    with open(PLANS_FILE, "w") as f:
        json.dump(plans, f, indent=2)


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


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

@app.route("/admin/api/email-config", methods=["GET"])
@require_admin
def admin_email_config():
    return jsonify({"enabled": EMAIL_ENABLED})


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
    send_email = bool(data.get("sendEmail", False))
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

    result = {"ok": True, "email": email}
    if send_email:
        if EMAIL_ENABLED:
            try:
                send_welcome_email(email, password, school_ids)
                result["emailSent"] = True
            except Exception as ex:
                result["emailError"] = str(ex)
        else:
            result["emailError"] = "Email not configured on server."
    return jsonify(result)


@app.route("/admin/api/reset", methods=["POST"])
@require_admin
def admin_reset_password():
    data       = request.json or {}
    email      = (data.get("email") or "").strip().lower()
    password   = (data.get("password") or "")
    send_email = bool(data.get("sendEmail", False))

    if not email or not password:
        return jsonify({"error": "email and password are required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    users = load_users()
    if email not in users:
        return jsonify({"error": "User not found."}), 404

    school_ids = _school_ids(users[email])
    users[email]["passwordHash"]      = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    users[email]["mustResetPassword"] = True
    save_users(users)

    result = {"ok": True}
    if send_email:
        if EMAIL_ENABLED:
            try:
                send_welcome_email(email, password, school_ids)
                result["emailSent"] = True
            except Exception as ex:
                result["emailError"] = str(ex)
        else:
            result["emailError"] = "Email not configured on server."
    return jsonify(result)


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


# ── Plan API ───────────────────────────────────────────────────────────────────

@app.route("/api/plan/<school_id>/<year>", methods=["GET"])
@require_session
def get_plan(email, user, school_id, year):
    if school_id not in _school_ids(user):
        return jsonify({"error": "Access denied"}), 403
    plans = load_plans()
    return jsonify(plans.get(f"{school_id}_{year}", {}))


@app.route("/api/plan/<school_id>/<year>", methods=["POST"])
@require_session
def save_plan(email, user, school_id, year):
    if school_id not in _school_ids(user):
        return jsonify({"error": "Access denied"}), 403
    data    = request.json or {}
    plans   = load_plans()
    key     = f"{school_id}_{year}"
    existing = plans.get(key, {})
    if existing.get("status") == "submitted":
        return jsonify({"error": "Plan already submitted and locked."}), 400
    plans[key] = {
        "schoolId":           school_id,
        "fiscalYear":         year,
        "status":             "draft",
        "allocEstimate":      data.get("allocEstimate", existing.get("allocEstimate")),
        "programDescription": data.get("programDescription", ""),
        "staffing":           data.get("staffing", []),
        "supplies":           data.get("supplies", []),
        "savedAt":            _now_iso(),
        "savedBy":            email,
        "submittedAt":        existing.get("submittedAt"),
        "submittedBy":        existing.get("submittedBy"),
    }
    save_plans(plans)
    return jsonify({"ok": True})


@app.route("/api/plan/<school_id>/<year>/submit", methods=["POST"])
@require_session
def submit_plan(email, user, school_id, year):
    if school_id not in _school_ids(user):
        return jsonify({"error": "Access denied"}), 403
    data    = request.json or {}
    plans   = load_plans()
    key     = f"{school_id}_{year}"
    existing = plans.get(key, {})
    if existing.get("status") == "submitted":
        return jsonify({"error": "Plan already submitted."}), 400
    plans[key] = {
        "schoolId":           school_id,
        "fiscalYear":         year,
        "status":             "submitted",
        "allocEstimate":      data.get("allocEstimate", existing.get("allocEstimate")),
        "programDescription": data.get("programDescription", ""),
        "staffing":           data.get("staffing", []),
        "supplies":           data.get("supplies", []),
        "savedAt":            _now_iso(),
        "savedBy":            email,
        "submittedAt":        _now_iso(),
        "submittedBy":        email,
    }
    save_plans(plans)
    return jsonify({"ok": True})


@app.route("/admin/api/plans", methods=["GET"])
@require_admin
def admin_list_plans():
    plans = load_plans()
    return jsonify(sorted(plans.values(), key=lambda p: (p.get("fiscalYear",""), p.get("schoolId",""))))


# ── Static files ───────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "ClearAMS Dashboard.html")


@app.route("/admin")
def admin_panel():
    return send_from_directory(BASE_DIR, "admin.html")


@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(BASE_DIR, filename)


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if not os.path.exists(USERS_FILE):
        save_users({})

    port = int(os.environ.get("PORT", 8080))
    print("=" * 60)
    print("  ClearAMS Server")
    print(f"  Dashboard : http://localhost:{port}/")
    print(f"  Admin     : http://localhost:{port}/admin")
    print(f"  Admin key : {ADMIN_KEY}")
    print("=" * 60)

    app.run(host="0.0.0.0", port=port, debug=False)
