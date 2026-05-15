import React from "react";
import ReactDOM from "react-dom/client";
import { Player } from "@remotion/player";
import { BudgetComposition } from "./BudgetComposition.jsx";
import { SCHOOLS } from "./data.js";

const params = new URLSearchParams(window.location.search);
const schoolId = params.get("school") || "hoover";
const school = SCHOOLS[schoolId];

function PlayerApp() {
  if (!school) {
    return (
      <div style={{ padding: 20, color: "#64748B", fontFamily: "system-ui", fontSize: 14 }}>
        School "{schoolId}" not found.
      </div>
    );
  }
  return (
    <Player
      component={BudgetComposition}
      inputProps={{ school }}
      durationInFrames={180}
      acknowledgeRemotionLicense
      fps={30}
      compositionWidth={1280}
      compositionHeight={720}
      style={{ width: "100%", aspectRatio: "16/9" }}
      autoPlay
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<PlayerApp />);
