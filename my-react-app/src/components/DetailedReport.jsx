import React from 'react';
import { renderStars, formatDate } from '../utils/ratingUtils.jsx';
import AnalysisDisplay from './AnalysisDisplay.jsx';

const DetailedReport = ({ rating, onClose }) => {

  return (
    <div className="detailed-report-overlay" onClick={onClose}>
      <div className="detailed-report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="detailed-report-header">
          <h2>Matcha Analysis Report</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="detailed-report-content">
          <div className="report-image-section">
            <img 
              src={rating.image_base64} 
              alt={`Matcha rating ${rating.id}`} 
              className="report-image"
            />
            <div className="report-date">
              {formatDate(rating.created_at)}
            </div>
          </div>

          <div className="report-rating-section">
            <h3>Quality Rating</h3>
            <div className="rating-display">
              <div className="rating-stars">
                {renderStars(rating.rating)}
              </div>
              <div className="rating-value">
                {rating.rating.toFixed(1)} / 5.0
              </div>
              {rating.confidence && (
                <div className="confidence-indicator">
                  AI Confidence: {(rating.confidence * 100).toFixed(0)}%
                </div>
              )}
            </div>
          </div>

          <div className="report-analysis-section">
            <AnalysisDisplay 
              analysis={rating.analysis}
              detailedAnalysis={rating.detailedAnalysis}
              recommendations={rating.recommendations}
              improvementTips={rating.detailedAnalysis?.improvementTips}
            />
          </div>

          {rating.comment && (
            <div className="report-comment-section">
              <h3>Your Comment</h3>
              <p className="user-comment">{rating.comment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedReport; 