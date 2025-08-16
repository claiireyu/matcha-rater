import React from 'react';

const AnalysisDisplay = ({ analysis, detailedAnalysis, recommendations, improvementTips }) => {
  const renderBasicAnalysis = () => {
    if (!analysis) return null;

    return (
      <div className="analysis-details">
        <div className="analysis-section">
          <h4>Color Analysis</h4>
          <p>{analysis.color || 'No color analysis available'}</p>
        </div>
        <div className="analysis-section">
          <h4>Texture Analysis</h4>
          <p>{analysis.texture || 'No texture analysis available'}</p>
        </div>
        <div className="analysis-section">
          <h4>Froth Analysis</h4>
          <p>{analysis.froth || 'No froth analysis available'}</p>
        </div>
        <div className="analysis-section">
          <h4>Overall Assessment</h4>
          <p>{analysis.overall || 'No overall assessment available'}</p>
        </div>
        {recommendations && recommendations.length > 0 && (
          <div className="recommendations-section">
            <h4>Recommendations</h4>
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderDetailedAnalysis = () => {
    if (!detailedAnalysis) return null;

    return (
      <div className="detailed-analysis">
        <h3>Detailed Analysis</h3>
        <div className="detailed-sections">
          {detailedAnalysis.colorAnalysis && (
            <div className="detailed-section">
              <h4>Color Analysis</h4>
              <p>{detailedAnalysis.colorAnalysis}</p>
            </div>
          )}
          {detailedAnalysis.textureAnalysis && (
            <div className="detailed-section">
              <h4>Texture Analysis</h4>
              <p>{detailedAnalysis.textureAnalysis}</p>
            </div>
          )}
          {detailedAnalysis.frothAnalysis && (
            <div className="detailed-section">
              <h4>Froth Analysis</h4>
              <p>{detailedAnalysis.frothAnalysis}</p>
            </div>
          )}
          {detailedAnalysis.overallQuality && (
            <div className="detailed-section">
              <h4>Overall Quality</h4>
              <p>{detailedAnalysis.overallQuality}</p>
            </div>
          )}
          {detailedAnalysis.gradeEstimate && (
            <div className="detailed-section">
              <h4>Estimated Grade</h4>
              <p className="grade-estimate">{detailedAnalysis.gradeEstimate}</p>
            </div>
          )}
          {improvementTips && improvementTips.length > 0 && (
            <div className="detailed-section">
              <h4>Improvement Tips</h4>
              <ul>
                {improvementTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderBasicAnalysis()}
      {renderDetailedAnalysis()}
    </>
  );
};

export default AnalysisDisplay; 