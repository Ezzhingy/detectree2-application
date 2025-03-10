interface LoadingStateProps {
  fileName: string;
  progress: number;
}

export function LoadingState({ fileName, progress }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-md">
        <p className="text-center text-gray-600 mb-4">{fileName}</p>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
} 