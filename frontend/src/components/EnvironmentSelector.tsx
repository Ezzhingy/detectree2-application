interface EnvironmentSelectorProps {
  selected: 'Forest' | 'Urban';
  onSelect: (environment: 'Forest' | 'Urban') => void;
}

export function EnvironmentSelector({ selected, onSelect }: EnvironmentSelectorProps) {
  return (
    <div className="flex items-center gap-6">
      <span className="text-black text-lg">Environment Type</span>
      <div className="flex gap-6">
        <label className="flex items-center gap-3">
          <input
            type="radio"
            name="environment"
            checked={selected === 'Forest'}
            onChange={() => onSelect('Forest')}
            className="w-5 h-5"
          />
          <span className="text-lg">Forest</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="radio"
            name="environment"
            checked={selected === 'Urban'}
            onChange={() => onSelect('Urban')}
            className="w-5 h-5"
          />
          <span className="text-lg">Urban</span>
        </label>
      </div>
    </div>
  );
} 