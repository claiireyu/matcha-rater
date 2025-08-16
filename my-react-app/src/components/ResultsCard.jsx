import React, { useState, useEffect } from "react";
import geminiService from "../services/geminiService";
import { renderStars } from "../utils/ratingUtils.jsx";
import AnalysisDisplay from "./AnalysisDisplay.jsx";

const ResultsCard = ({ capturedImage, statusMessage, onTryAnother, analysisResult, isAnalyzing: externalIsAnalyzing }) => {
  const [matchaAnalysis, setMatchaAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [manualRating, setManualRating] = useState(0);
  const [displayMessage, setDisplayMessage] = useState(statusMessage);
  const [comment, setComment] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [detailedAnalysis, setDetailedAnalysis] = useState(null);

  useEffect(() => {
    setDisplayMessage(statusMessage);
    
    // Use the analysis result passed from Camera component
    if (analysisResult) {
      console.log('Setting analysis from Camera:', analysisResult);
      setMatchaAnalysis(analysisResult);
      setManualRating(analysisResult.rating);
      setIsAnalyzing(false);
    } else if (capturedImage && !analysisResult) {
      // Reset when no analysis result
      setMatchaAnalysis(null);
      setManualRating(0);
      setIsEditing(false);
      setComment("");
      setIsSaved(false);
      setShowDetailedAnalysis(false);
      setDetailedAnalysis(null);
    }
  }, [capturedImage, statusMessage, analysisResult]);

  // Sync with external analyzing state
  useEffect(() => {
    setIsAnalyzing(externalIsAnalyzing);
  }, [externalIsAnalyzing]);

  const getDetailedAnalysis = async () => {
    if (!capturedImage || !matchaAnalysis) return;
    
    try {
      setShowDetailedAnalysis(true);
      const detailed = await geminiService.getDetailedAnalysis(capturedImage, matchaAnalysis.rating);
      setDetailedAnalysis(detailed);
    } catch (error) {
      console.error('Error getting detailed analysis:', error);
    }
  };

  const sendToServer = async () => {
    if (!capturedImage || !matchaAnalysis) return;

    try {
      // Prepare the data to save
      const saveData = {
        imageBase64: capturedImage,
        rating: matchaAnalysis.rating,
        comment: comment,
        analysis: matchaAnalysis.analysis,
        confidence: matchaAnalysis.confidence,
        recommendations: matchaAnalysis.recommendations
      };

      // If detailed analysis is available, include it
      if (detailedAnalysis) {
        saveData.detailedAnalysis = {
          colorAnalysis: detailedAnalysis.detailedAnalysis.colorAnalysis,
          textureAnalysis: detailedAnalysis.detailedAnalysis.textureAnalysis,
          frothAnalysis: detailedAnalysis.detailedAnalysis.frothAnalysis,
          overallQuality: detailedAnalysis.detailedAnalysis.overallQuality,
          gradeEstimate: detailedAnalysis.gradeEstimate,
          improvementTips: detailedAnalysis.improvementTips,
          detailedConfidence: detailedAnalysis.confidence
        };
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveData),
      });

      if (response.ok) {
        setDisplayMessage("Saved successfully! Redirecting to camera...");
        setIsSaved(true);
        setTimeout(() => {
          onTryAnother();
        }, 1500);
      } else {
        setDisplayMessage("Failed to save. Please try again.");
      }
    } catch (error) {
      console.error("Save error:", error);
      setDisplayMessage("An error occurred while saving.");
    }
  };

  const handleRatingChange = (newRating) => {
    setManualRating(Math.max(0, Math.min(5, newRating)));
  };

  const handleSaveRating = () => {
    setMatchaAnalysis(prev => ({ ...prev, rating: manualRating }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setManualRating(matchaAnalysis ? matchaAnalysis.rating : 0);
    setIsEditing(false);
  };





  const renderEditableRating = () => {
    return (
      <div className="matcha-rating editable">
        <div className="rating-header">
          <div className="rating-label">Matcha Quality Rating:</div>
          <button 
            className="edit-button"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        </div>
        <div className="rating-stars">
          {renderStars(matchaAnalysis.rating)}
        </div>
        <div className="rating-value">
          {matchaAnalysis.rating.toFixed(1)} / 5.0
        </div>
        <div className="confidence-indicator">
          Confidence: {(matchaAnalysis.confidence * 100).toFixed(0)}%
        </div>
      </div>
    );
  };

  const renderEditMode = () => {
    return (
      <div className="matcha-rating edit-mode">
        <div className="rating-header">
          <div className="rating-label">Edit Rating:</div>
          <div className="edit-controls">
            <button 
              className="save-button"
              onClick={handleSaveRating}
            >
              Save
            </button>
            <button 
              className="cancel-button"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
        <div className="rating-input-container">
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={manualRating}
            onChange={(e) => handleRatingChange(parseFloat(e.target.value))}
            className="rating-slider"
          />
          <div className="rating-input-display">
            <span className="current-rating">{manualRating.toFixed(1)}</span>
            <span className="rating-max">/ 5.0</span>
          </div>
        </div>
        <div className="rating-stars">
          {renderStars(manualRating)}
        </div>
      </div>
    );
  };

  if (!capturedImage) {
    return (
      <div className="results-card">
        <div className="results-placeholder">
          <p>No image captured yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="results-card">
      <button 
        className="back-arrow-button"
        onClick={onTryAnother}
        aria-label="Go back to camera"
      >
        ←
      </button>
      <div className="results-content">
        <img 
          src={capturedImage} 
          alt="Captured" 
          className="captured-image"
        />
        
        <div className="status-message">
          {displayMessage}
        </div>

        {isAnalyzing && (
          <div className="analyzing-message">
            <div className="loading-spinner"></div>
            Analyzing matcha quality...
          </div>
        )}

        {matchaAnalysis && !isAnalyzing && (
          isEditing ? renderEditMode() : renderEditableRating()
        )}

        {matchaAnalysis && !isAnalyzing && (
          <div className="analysis-container">
            <AnalysisDisplay 
              analysis={matchaAnalysis.analysis}
              detailedAnalysis={detailedAnalysis?.detailedAnalysis}
              recommendations={matchaAnalysis.recommendations}
              improvementTips={detailedAnalysis?.improvementTips}
            />
            
            {!showDetailedAnalysis && (
              <button 
                onClick={getDetailedAnalysis}
                className="detailed-analysis-button"
              >
                Get Detailed Analysis
              </button>
            )}
          </div>
        )}

        {matchaAnalysis && !isAnalyzing && (
          <div className="comment-section">
            <label htmlFor="comment-box" className="comment-label">
              Comment (optional):
            </label>
            <textarea
              id="comment-box"
              className="comment-textarea"
              placeholder="Share your thoughts about this matcha..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        )}

        {matchaAnalysis && !isAnalyzing && !isSaved && (
          <button onClick={sendToServer} className="save-to-db-button">
            Save Rating & Comment
          </button>
        )}

        {!matchaAnalysis && !isAnalyzing && (
          <button 
            onClick={onTryAnother} 
            className="try-another-button"
          >
            Retake
          </button>
        )}

        {matchaAnalysis && isSaved && (
          <div className="saved-message">
            <p>Review saved!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsCard; 