import React from 'react';

// Utility functions for rating components

export const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const hasQuarterStar = rating % 1 >= 0.125 && rating % 1 < 0.375;
  const hasThreeQuarterStar = rating % 1 >= 0.625 && rating % 1 < 0.875;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<span key={i} className="star filled">★</span>);
    } else if (i === fullStars && hasThreeQuarterStar) {
      stars.push(<span key={i} className="star three-quarters">★</span>);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<span key={i} className="star half-filled">★</span>);
    } else if (i === fullStars && hasQuarterStar) {
      stars.push(<span key={i} className="star quarter-filled">★</span>);
    } else {
      stars.push(<span key={i} className="star empty">☆</span>);
    }
  }
  return stars;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const renderAnalysisSection = (analysis, title = "Analysis") => {
  if (!analysis) return null;

  return (
    <div className="analysis-section">
      <h4>{title}</h4>
      <p>{analysis}</p>
    </div>
  );
};

export const renderRecommendations = (recommendations, title = "Recommendations") => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="recommendations-section">
      <h4>{title}</h4>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
}; 