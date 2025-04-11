import { useState, useEffect } from 'react';

interface UseImageLoadingResult {
  isLoading: boolean;
  loadingProgress: number;
  fileName: string | null;
  startLoading: (file: File) => void;
  stopLoading: () => void;
}

export function useImageLoading(): UseImageLoadingResult {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progressInterval, setProgressInterval] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [progressInterval]);

  const startLoading = (file: File) => {
    setFileName(file.name);
    setIsLoading(true);
    setLoadingProgress(0);

    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 70) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    setProgressInterval(interval);
  };

  const stopLoading = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    setLoadingProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setFileName(null);
    }, 500);
  };

  return {
    isLoading,
    loadingProgress,
    fileName,
    startLoading,
    stopLoading
  };
} 