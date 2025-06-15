import { useState, useEffect } from "react";
import { ConfidenceSlider } from "./ConfidenceSlider";
import { Tooltip } from "./Tooltip";

interface EnvironmentSelectorProps {
  selected: "Default" | "Forest" | "Urban";
  onSelect: (environment: "Default" | "Forest" | "Urban") => void;
  onEnvironmentConfigChange?: (config: {
    environment: "Default" | "Forest" | "Urban";
    confidence: number;
  }) => void;
}

export function EnvironmentSelector({
  selected,
  onSelect,
  onEnvironmentConfigChange,
}: EnvironmentSelectorProps) {
  const [confidence, setConfidence] = useState(0.5); // Default value of 0.5

  // Update the backend whenever either value changes
  useEffect(() => {
    onEnvironmentConfigChange?.({
      environment: selected,
      confidence: confidence,
    });
  }, [selected, confidence, onEnvironmentConfigChange]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-6">
        <Tooltip text="Select the environment type for analysis." />
        <span className="text-black text-lg">Environment Type</span>
        <div className="flex gap-6">
          {/* <label className="flex items-center gap-3">
            <input
              type="radio"
              name="environment"
              checked={selected === "Default"}
              onChange={() => onSelect("Default")}
              className="w-5 h-5"
            />
            <span className="text-lg text-gray-500">Default</span>
          </label> */}
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="environment"
              checked={selected === "Forest"}
              onChange={() => onSelect("Forest")}
              className="w-5 h-5"
            />
            <span className="text-lg text-gray-500">Forest</span>
          </label>
          {/* <label className="flex items-center gap-3">
            <input
              type="radio"
              name="environment"
              checked={selected === "Urban"}
              onChange={() => onSelect("Urban")}
              className="w-5 h-5"
            />
            <span className="text-lg text-gray-500">Urban</span>
          </label> */}
        </div>
      </div>

      <ConfidenceSlider value={confidence} onChange={setConfidence} />
    </div>
  );
}
