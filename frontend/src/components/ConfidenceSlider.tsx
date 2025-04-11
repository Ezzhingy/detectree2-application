import { Tooltip } from "./Tooltip";

interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function ConfidenceSlider({ value, onChange }: ConfidenceSliderProps) {
  return (
    <div className="flex items-center gap-6">
      <Tooltip text="Adjust the confidence level for tree detection." />
      <span className="text-black text-lg">Confidence</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-48"
      />
      <span className="text-gray-500 text-sm">{value.toFixed(2)}</span>
    </div>
  );
} 