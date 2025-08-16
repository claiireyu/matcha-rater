import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import ResultsCard from "./ResultsCard";

const videoConstraints = {
  width: 720,
  height: 720,
  facingMode: "user",
};

const Camera = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [model, setModel] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Loading cup detection model...");

  useEffect(() => {
    const loadModel = async () => {
      try {
        setStatusMessage("Loading cup detection model...");
        
        // Load MobileNet model using TensorFlow.js
        const mobilenet = await window.mobilenet.load();
        setModel(mobilenet);
        setStatusMessage("Cup detection ready! Point your matcha cup at the camera.");
      } catch (error) {
        console.error("Error loading model:", error);
        setStatusMessage("Model failed to load.");
      }
    };
    
    // Wait for TensorFlow.js to be available
    setTimeout(loadModel, 1000);
  }, []);

  const detectCup = useCallback(async (imageBase64) => {
    if (!model) {
              setStatusMessage("Model still loading...");
      return;
    }

    try {
      // Create an image element
      const img = new Image();
      img.src = imageBase64;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Classify the image
      const predictions = await model.classify(img);
      
      // Debug: Log what the model detected
      console.log('Cup Detection Debug - Model Predictions:', predictions.map(p => ({
        className: p.className,
        probability: p.probability.toFixed(3)
      })));

      // Look for specific cup-related terms with higher confidence requirements
      const cupTerms = [
        'cup', 'cups', 'mug', 'mugs', 'glass', 'glasses', 'bottle', 'bottles', 'bowl', 'bowls',
        'container', 'containers', 'vessel', 'vessels', 'coffee', 'tea', 'drink', 'beverage',
        'liquid', 'water', 'juice', 'soda', 'can', 'cans', 'tumbler', 'tumblers',
        'thermos', 'thermoses', 'flask', 'flasks', 'pitcher', 'pitchers', 'jug', 'jugs',
        'jar', 'jars', 'pot', 'pots', 'kettle', 'kettles', 'teapot', 'teapots',
        'bucket', 'buckets', 'pail', 'pails', 'vase', 'vases', 'dish', 'dishes',
        'plate', 'plates', 'saucer', 'saucers', 'tankard', 'goblet', 'chalice', 'stein',
        'shot glass', 'wine glass', 'beer glass', 'mason jar', 'measuring cup',
        'crock pot', 'slow cooker', 'casserole', 'pan', 'saucepan', 'beaker'
      ];
      
      const foundCup = predictions.some(prediction => {
        const className = prediction.className.toLowerCase();
        const probability = prediction.probability;
        
        // Use a more precise regex for whole-word matching
        const hasCupTerm = cupTerms.some(term => {
          const regex = new RegExp(`\\b${term}\\b`, 'i');
          return regex.test(className);
        });
        
        return hasCupTerm && probability > 0.1;
      });

      if (foundCup) {
        setStatusMessage("Cup detected! Analyzing matcha color...");
        
      } else {
        setStatusMessage("No cup detected. Try positioning the cup better");
      }
    } catch (error) {
      console.error("Detection error:", error);
      setStatusMessage("Error during cup detection.");
    }
  }, [model]);

    const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    setStatusMessage("Capturing image...");
    detectCup(imageSrc);
  }, [webcamRef, detectCup]);

  const handleUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageSrc = e.target.result;
        setImage(imageSrc);
        setStatusMessage("Uploading image...");
        await detectCup(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  }, [detectCup]);

  const handleTryAnother = useCallback(() => {
    setImage(null);
    setStatusMessage("Cup detection ready! Point your matcha at the camera.");
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
            >
              Capture
            </button>
            <label className="upload-button">
              Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      ) : (
        <ResultsCard 
          capturedImage={image}
          statusMessage={statusMessage}
          onTryAnother={handleTryAnother}
        />
      )}
    </div>
  );
};

export default Camera;
