import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import ResultsCard from "./ResultsCard";
import geminiService from "../services/geminiService";

const videoConstraints = {
  width: 720,
  height: 720,
  facingMode: "user",
};

const Camera = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Ready to analyze matcha! Point your cup at the camera.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const analyzeImage = useCallback(async (imageBase64) => {
    setIsAnalyzing(true);
    setStatusMessage("Analyzing image...");
    
    try {
      console.log('Starting Gemini analysis...');
      const analysis = await geminiService.analyzeMatchaImage(imageBase64);
      console.log('Gemini analysis result:', analysis);
      
      if (analysis.cupDetected) {
        setStatusMessage("Cup detected! Analyzing matcha quality...");
        setAnalysisResult(analysis);
        return analysis;
      } else {
        console.log('No cup detected by Gemini');
        setStatusMessage("No cup detected. Please position a cup or container in the frame.");
        setIsAnalyzing(false);
        setAnalysisResult(null);
        return null;
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setStatusMessage("Error during analysis. Please try again.");
      setIsAnalyzing(false);
      setAnalysisResult(null);
      return null;
    }
  }, []);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setStatusMessage("Capturing image...");
    
    const analysis = await analyzeImage(imageSrc);
    if (analysis) {
      setStatusMessage("Analysis complete!");
      setIsAnalyzing(false);
    }
  }, [analyzeImage]);

  const handleUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageSrc = e.target.result;
        setImage(imageSrc);
        setStatusMessage("Uploading image...");
        
        const analysis = await analyzeImage(imageSrc);
        if (analysis) {
          setStatusMessage("Analysis complete!");
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [analyzeImage]);

  const handleTryAnother = useCallback(() => {
    setImage(null);
    setStatusMessage("Ready to analyze matcha! Point your cup at the camera.");
    setIsAnalyzing(false);
    setAnalysisResult(null);
  }, []);

  return (
    <div className="camera-container">
      {!image ? (
        <div className="camera-card">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="webcam-feed"
          />
          <div className="button-container">
            <button 
              onClick={capture}
              className="capture-button"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Capture"}
            </button>
            <label className="upload-button">
              Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                style={{ display: 'none' }}
                disabled={isAnalyzing}
              />
            </label>
          </div>
          <div className="status-message">
            {statusMessage}
          </div>
        </div>
      ) : (
        <ResultsCard 
          capturedImage={image}
          statusMessage={statusMessage}
          onTryAnother={handleTryAnother}
          analysisResult={analysisResult}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
};

export default Camera;
