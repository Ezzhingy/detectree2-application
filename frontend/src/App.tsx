import { useState } from "react";
import { Card } from "./components/Card";
import { ImageUpload } from "./components/ImageUpload";
import { EnvironmentSelector } from "./components/EnvironmentSelector";
import { GitHubIcon } from "./components/GitHubIcon";
import { useImageLoading } from "./hooks/useImageLoading";

function Title() {
  return (
    <div className="flex flex-row justify-end p-2">
      <h1 className="text-4xl font-bold text-black">detectree2</h1>
    </div>
  );
}

function App() {
  const [environment, setEnvironment] = useState<
    "Default" | "Forest" | "Urban"
  >("Forest");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0.5);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [statistics, setStatistics] = useState<{ total_trees: number } | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    isLoading,
    loadingProgress,
    mode,
    loadingMessage,
    startUpload,
    updateProgress,
    startProcessing,
    stopProcessing,
    reset: resetLoadingState,
  } = useImageLoading();

  const resetImage = () => {
    setSelectedImage(null);
    setPreview(null);
    setAnalysisComplete(false);
    setStatistics(null);
    setErrorMessage(null);
    resetLoadingState();
  };

  const uploadImage = async () => {
    if (!selectedImage) return;

    setErrorMessage(null); // Clear previous errors

    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("environment", environment);
    formData.append("confidence", confidence.toString());

    startUpload(selectedImage);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.detectree2.tech/", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        updateProgress(percent);
      }
    };

    xhr.upload.onload = () => {
      startProcessing(selectedImage);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          stopProcessing(); // Stop processing when we get the result
          setPreview(data.image);
          setStatistics(data.statistics);
          setAnalysisComplete(true);
        } catch (e) {
          stopProcessing(); // Stop processing on error
          setErrorMessage("Failed to parse server response. Please try again.");
          console.error("Failed to parse response:", e);
        }
      } else {
        stopProcessing(); // Stop processing on error
        setErrorMessage("Analysis failed (server error). Please try again.");
        console.error("Failed to upload image", xhr.statusText);
      }
    };

    xhr.onerror = () => {
      stopProcessing(); // Stop processing on error
      setErrorMessage("Network error during analysis. Please try again.");
      console.error("Error uploading image");
    };

    xhr.send(formData);
  };

  const handleEnvironmentConfigChange = (config: {
    environment: "Default" | "Forest" | "Urban";
    confidence: number;
  }) => {
    setEnvironment(config.environment);
    setConfidence(config.confidence);
  };

  const handleDownload = async (fileType: "png" | "gpkg") => {
    try {
      const response = await fetch(
        `https://api.detectree2.tech/download/${fileType}`
      );
      if (!response.ok) {
        throw new Error(`Failed to download ${fileType} file`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileType === "png" ? "result.png" : "crowns_out.gpkg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${fileType} file:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-green-100 p-8">
      <Title />

      {/* Error message display */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-center">
          {errorMessage}
        </div>
      )}

      {/* Upload and Processing progress modal */}
      {isLoading && (mode === "upload" || mode === "processing") && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-600 mb-4"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <p className="text-lg text-gray-700 mb-2">{loadingMessage}</p>
            {mode === "upload" && (
              <>
                <div className="w-64 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{loadingProgress}%</p>
              </>
            )}
            {mode === "processing" && (
              <>
                <div className="w-64 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Processing... {Math.round(loadingProgress)}%
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto flex justify-center items-center">
        <Card>
          <div className="relative flex flex-col items-center">
            {preview ? (
              <>
                <div className="relative min-h-[600px] flex items-center justify-center">
                  <div className="flex gap-8 items-center">
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Analysis Result"
                        className="max-w-full max-h-[500px] object-contain"
                      />
                      <button
                        onClick={resetImage}
                        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black bg-opacity-60 hover:bg-opacity-80 transition-all"
                        aria-label="Reset image"
                      >
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    {statistics && (
                      <div className="bg-white p-6 rounded-lg shadow-lg h-fit">
                        <h2 className="text-xl text-black font-bold mb-4">
                          Analysis Results
                        </h2>
                        <table className="min-w-[200px]">
                          <tbody>
                            <tr className="border-b">
                              <td className="text-black py-2 pr-4 font-semibold">
                                Total Trees Detected
                              </td>
                              <td className="text-black py-2 px-4">
                                {statistics.total_trees}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-4">
                    {analysisComplete && (
                      <>
                        <button
                          onClick={() => handleDownload("png")}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download PNG
                        </button>
                        <button
                          onClick={() => handleDownload("gpkg")}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download GPKG
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <ImageUpload
                onImageSelect={setSelectedImage}
                onReset={resetImage}
                hasFile={!!selectedImage}
              />
            )}
          </div>

          <div className="flex justify-between items-center px-4 mt-12">
            <div className="flex items-center">
              <EnvironmentSelector
                selected={environment}
                onSelect={setEnvironment}
                onEnvironmentConfigChange={handleEnvironmentConfigChange}
              />
            </div>
            <button
              className="px-8 py-3 bg-green-100 text-gray-600 rounded-full hover:bg-green-200 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedImage}
              onClick={uploadImage}
            >
              Analyze Image
            </button>
          </div>
        </Card>
      </div>
      <div className="flex flex-row items-center mt-4 text-center">
        <a
          href="https://github.com/PatBall1/detectree2"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <GitHubIcon />
          <span>GitHub Repository</span>
        </a>
      </div>
    </div>
  );
}

export default App;
