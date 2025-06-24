import { useState, useEffect } from "react";

export type LoadingMode = "idle" | "preview" | "upload" | "processing";

interface UseImageLoadingResult {
  isLoading: boolean;
  loadingProgress: number;
  fileName: string | null;
  mode: LoadingMode;
  loadingMessage: string;
  startLoading: (file: File) => void;
  stopLoading: () => void;
  startUpload: (file: File) => void;
  updateProgress: (progress: number) => void;
  startProcessing: (file: File) => void;
  stopProcessing: () => void;
  reset: () => void;
}

export function useImageLoading(): UseImageLoadingResult {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progressInterval, setProgressInterval] = useState<number | null>(null);
  const [mode, setMode] = useState<LoadingMode>("idle");
  const [loadingMessage, setLoadingMessage] = useState("");

  const reset = () => {
    setIsLoading(false);
    setLoadingProgress(0);
    setFileName(null);
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    setMode("idle");
    setLoadingMessage("");
  };

  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [progressInterval]);

  // For preview loading
  const startLoading = (file: File) => {
    setFileName(file.name);
    setIsLoading(true);
    setLoadingProgress(0);
    setMode("preview");
    setLoadingMessage("Loading preview...");

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
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
      setMode("idle");
      setLoadingMessage("");
    }, 500);
  };

  // For upload progress
  const startUpload = (file: File) => {
    setFileName(file.name);
    setIsLoading(true);
    setLoadingProgress(0);
    setMode("upload");
    setLoadingMessage("Uploading image...");
  };

  const updateProgress = (progress: number) => {
    setLoadingProgress(progress);
  };

  // For processing phase
  const startProcessing = (file: File) => {
    setFileName(file.name);
    setIsLoading(true);
    setLoadingProgress(0);
    setMode("processing");
    setLoadingMessage("Processing image (this may take 5-10 minutes)...");

    // Start a simulated progress for processing (since we don't have real progress)
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 5; // Random increment to simulate processing
      });
    }, 1000);

    setProgressInterval(interval);
  };

  const stopProcessing = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    setLoadingProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setFileName(null);
      setMode("idle");
      setLoadingMessage("");
    }, 500);
  };

  return {
    isLoading,
    loadingProgress,
    fileName,
    mode,
    loadingMessage,
    startLoading,
    stopLoading,
    startUpload,
    updateProgress,
    startProcessing,
    stopProcessing,
    reset,
  };
}
