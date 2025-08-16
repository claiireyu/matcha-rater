import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DetailedReport from './DetailedReport';

const Gallery = () => {
  const [ratings, setRatings] = useState([]);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/ratings`);
        if (!response.ok) {
          throw new Error('Failed to fetch ratings');
        }
        const data = await response.json();
        setRatings(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRatings();
  }, []);

  const handleDelete = async (id) => {
    console.log('Attempting to delete rating with ID:', id);
    if (window.confirm('Are you sure you want to delete this rating?')) {
      setDeletingId(id);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/ratings/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete rating');
        }
        
        console.log('Successfully deleted rating with ID:', id);
        setRatings(ratings.filter(rating => rating.id !== id));
      } catch (err) {
        console.error('Delete error:', err);
        setError(err.message);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleItemClick = (rating) => {
    setSelectedRating(rating);
    document.body.classList.add('modal-open');
  };

  const handleCloseReport = () => {
    setSelectedRating(null);
    document.body.classList.remove('modal-open');
  };

  if (error) {
    return <div className="gallery-error">Error: {error}</div>;
  }

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <Link to="/" className="back-button">Back</Link>
        <h1>Gallery</h1>
      </div>
      <div className="gallery-grid">
        {ratings.map((rating) => (
          <div 
            key={rating.id} 
            className="gallery-item"
            onClick={() => handleItemClick(rating)}
          >
            <img src={rating.image_base64} alt={`Matcha rating ${rating.id}`} />
            <div className="gallery-item-overlay">
              <div className="gallery-item-comment">{rating.comment}</div>
              <div className="gallery-item-rating">
                {typeof rating.rating === 'number' ? `${rating.rating.toFixed(1)}/5.0` : 'N/A'}
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(rating.id);
                  }}
                  disabled={deletingId === rating.id}
                  aria-label="Delete"
                >
                  {deletingId === rating.id ? 'Deleting...' : <DeleteOutlineIcon fontSize="small" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRating && (
        <DetailedReport 
          rating={selectedRating} 
          onClose={handleCloseReport} 
        />
      )}
    </div>
  );
};

export default Gallery; 