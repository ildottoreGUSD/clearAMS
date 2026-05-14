import { Composition } from "remotion";
import { BudgetComposition } from "./BudgetComposition.jsx";
import { SCHOOLS } from "./data.js";

const FPS      = 30;
const DURATION = 90; // 3 seconds — adjust for longer renders

export function RemotionRoot() {
  return (
    <>
      {Object.entries(SCHOOLS).map(([id, school]) => (
        <Composition
          key={id}
          id={`budget-${id}`}
          component={BudgetComposition}
          durationInFrames={DURATION}
          fps={FPS}
          width={1280}
          height={720}
          defaultProps={{ school }}
        />
      ))}
    </>
  );
}
