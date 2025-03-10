import { useState, useRef, DragEvent } from 'react';
import { LoadingState } from './LoadingState';
import { useImageLoading } from '../hooks/useImageLoading';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

export function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoading, loadingProgress, fileName, startLoading, stopLoading } = useImageLoading();

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      startLoading(file);
      onImageSelect(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        stopLoading();
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed 
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} 
          rounded-2xl p-8 mb-4 min-h-[500px] cursor-pointer transition-colors relative`}
      >
        {isLoading ? (
          <LoadingState fileName={fileName || ''} progress={loadingProgress} />
        ) : previewUrl ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative max-w-full max-h-[450px] w-auto h-auto">
              <img 
                src={previewUrl} 
                alt="Selected preview" 
                className="max-h-[450px] w-auto rounded-xl object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-opacity"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-gray-600 mb-6">
              <svg className="w-24 h-24 mx-auto mb-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className="text-3xl text-blue-600 mb-5">Select an image to analyze</h3>
            <p className="text-xl text-gray-400">PNG, JPG, GIF up to 50mb</p>
          </>
        )}
      </div>
    </>
  );
} 