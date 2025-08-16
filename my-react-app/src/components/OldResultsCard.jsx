import React, { useState, useEffect } from "react";

// --- Matcha Analysis Logic ---

const referenceGreens = [
  { hex: '#a7c4a7', name: 'Light Grayish Green', rating: 2.0 },
  { hex: '#87a96b', name: 'Muted Green', rating: 3.5 },
  { hex: '#688e31', name: 'Medium Green', rating: 4.5 },
  { hex: '#497300', name: 'Dark Olive Green', rating: 5.0 }
];

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
};

const colorDistance = (rgb1, rgb2) => {
  return Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
    Math.pow(rgb1[1] - rgb2[1], 2) +
    Math.pow(rgb1[2] - rgb2[2], 2)
  );
};

const analyzeMatchaColor = (imageSrc) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const region = {
        x: canvas.width * 0.3,
        y: canvas.height * 0.35,
        width: canvas.width * 0.4,
        height: canvas.height * 0.3
      };
      
      let greenPixels = 0, totalPixels = 0;
      let weightedRatingSum = 0;
      let inverseDistanceSum = 0;
      const epsilon = 1e-6;
      
      for (let y = region.y; y < region.y + region.height; y++) {
        for (let x = region.x; x < region.x + region.width; x++) {
          const index = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
          const r_norm = data[index] / 255;
          const g_norm = data[index + 1] / 255;
          const b_norm = data[index + 2] / 255;
          
          const max = Math.max(r_norm, g_norm, b_norm);
          const min = Math.min(r_norm, g_norm, b_norm);
          const diff = max - min;
          let h = 0;
          if (diff !== 0) {
            if (max === g_norm) h = 60 * (((b_norm - r_norm) / diff) + 2);
            else if (max === r_norm) h = 60 * (((g_norm - b_norm) / diff) + 4);
            else h = 60 * (((r_norm - g_norm) / diff) + 6);
          }
          if (h < 0) h += 360;

          if (h >= 70 && h <= 180) {
            const currentRgb = [data[index], data[index + 1], data[index + 2]];
            let minDistance = Infinity;
            let closestRef = null;

            referenceGreens.forEach(ref => {
              const refRgb = hexToRgb(ref.hex);
              if (refRgb) {
                const distance = colorDistance(currentRgb, refRgb);
                if (distance < minDistance) {
                  minDistance = distance;
                  closestRef = ref;
                }
              }
            });

            const colorMatchThreshold = 80;
            if (closestRef && minDistance < colorMatchThreshold) {
              greenPixels++;
              const weight = 1 / (minDistance + epsilon);
              weightedRatingSum += closestRef.rating * weight;
              inverseDistanceSum += weight;
            }
          }
          totalPixels++;
        }
      }
      
      const greenRatio = totalPixels > 0 ? greenPixels / totalPixels : 0;
      const interpolatedRating = inverseDistanceSum > 0 ? weightedRatingSum / inverseDistanceSum : 0;
      
      const greenDensityThreshold = 0.01;
      const rating = greenRatio > greenDensityThreshold ? interpolatedRating : 0;
      
      resolve({ rating });
    };
    img.src = imageSrc;
  });
};

// --- React Component ---

const ResultsCard = ({ capturedImage, statusMessage, onTryAnother }) => {
  const [matchaRating, setMatchaRating] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [manualRating, setManualRating] = useState(0);
  const [displayMessage, setDisplayMessage] = useState(statusMessage);
  const [comment, setComment] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setDisplayMessage(statusMessage);
    if (capturedImage && statusMessage === 'Cup detected! Analyzing matcha color...') {
      setIsAnalyzing(true);
      analyzeMatchaColor(capturedImage)
        .then(result => {
          setMatchaRating(result);
          setManualRating(result.rating);
          setIsAnalyzing(false);
          setDisplayMessage("Analysis complete!");
        })
        .catch(error => {
          console.error('Error analyzing matcha:', error);
          setMatchaRating({ rating: 0 });
          setManualRating(0);
          setIsAnalyzing(false);
          setDisplayMessage("Error during analysis.");
        });
    } else {
      setMatchaRating(null);
      setManualRating(0);
      setIsEditing(false);
      setComment("");
      setIsSaved(false);
    }
  }, [capturedImage, statusMessage]);

  const sendToServer = async () => {
    if (!capturedImage || !matchaRating) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: capturedImage,
          rating: matchaRating.rating,
          comment: comment,
        }),
      });

      if (response.ok) {
        setDisplayMessage("Saved successfully! Redirecting to camera...");
        setIsSaved(true);
        // Auto-redirect back to camera after a short delay
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
    setMatchaRating({ rating: manualRating });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setManualRating(matchaRating ? matchaRating.rating : 0);
    setIsEditing(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
    const hasQuarterStar = rating % 1 >= 0.125 && rating % 1 < 0.375;
    const hasThreeQuarterStar = rating % 1 >= 0.625 && rating % 1 < 0.875;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">*</span>);
      } else if (i === fullStars && hasThreeQuarterStar) {
        stars.push(<span key={i} className="star three-quarters">*</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="star half-filled">*</span>);
      } else if (i === fullStars && hasQuarterStar) {
        stars.push(<span key={i} className="star quarter-filled">*</span>);
      } else {
        stars.push(<span key={i} className="star empty">*</span>);
      }
    }
    return stars;
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
          {renderStars(matchaRating.rating)}
        </div>
        <div className="rating-value">
          {matchaRating.rating.toFixed(1)} / 5.0
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
            Analyzing matcha quality...
          </div>
        )}

        {matchaRating && !isAnalyzing && (
          isEditing ? renderEditMode() : renderEditableRating()
        )}

        {matchaRating && !isAnalyzing && (
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

        {matchaRating && !isAnalyzing && !isSaved && (
          <button onClick={sendToServer} className="save-to-db-button">
            Save Rating & Comment
          </button>
        )}

        {!matchaRating && !isAnalyzing && (
          <button 
            onClick={onTryAnother} 
            className="try-another-button"
          >
            Retake
          </button>
        )}

        {matchaRating && isSaved && (
          <div className="saved-message">
            <p>Review saved! Redirecting to camera...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsCard; 