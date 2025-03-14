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
  const [environment, setEnvironment] = useState<"Forest" | "Urban">("Forest");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-green-100 p-4">
      <Title />

      <div className="w-full max-w-6xl mx-auto">
        <div
          className="flex items-center justify-center"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <Card>
            <ImageUpload onImageSelect={setSelectedImage} />
            <div className="flex justify-between items-center px-4">
              <EnvironmentSelector
                selected={environment}
                onSelect={setEnvironment}
              />
              <button
                className="px-8 py-3 bg-green-100 text-gray-600 rounded-full hover:bg-green-200 transition-colors text-lg"
                disabled={!selectedImage}
              >
                Analyze Image
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
