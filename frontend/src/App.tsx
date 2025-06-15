import { useState } from "react";
import { Card } from "./components/Card";
import { ImageUpload } from "./components/ImageUpload";
import { EnvironmentSelector } from "./components/EnvironmentSelector";

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
  >("Default");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0.5);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [statistics, setStatistics] = useState<{ total_trees: number } | null>(
    null
  );

  const resetImage = () => {
    setSelectedImage(null);
    setPreview(null);
    setAnalysisComplete(false);
    setStatistics(null);
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("environment", environment);
    formData.append("confidence", confidence.toString());

    try {
      const response = await fetch("https://api.detectree2.tech/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      console.log("Received data:", data);
      setPreview(data.image);
      setStatistics(data.statistics);
      console.log("Updated statistics:", data.statistics);
      setAnalysisComplete(true);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
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
                        className="absolute top-4 right-4 w-10 h-10 bg-gray-800 bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all text-2xl"
                        aria-label="Reset image"
                      >
                        ×
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
              <ImageUpload onImageSelect={setSelectedImage} />
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
              className="px-8 py-3 bg-green-100 text-gray-600 rounded-full hover:bg-green-200 transition-colors text-lg"
              disabled={!selectedImage}
              onClick={uploadImage}
            >
              Analyze Image
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
