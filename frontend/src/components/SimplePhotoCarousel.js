import React, { useState } from 'react';
import './PhotoCarousel.css';

const SimplePhotoCarousel = ({ photos = [], altText = "Place photo", className = "" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Simple placeholder
    const placeholder = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="%23f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Image Available</text></svg>';
    
    const displayPhotos = photos && photos.length > 0 ? photos : [placeholder];

    const goToPrevious = () => {
        console.log('Previous clicked, current index:', currentIndex);
        setCurrentIndex(prev => {
            const newIndex = prev === 0 ? displayPhotos.length - 1 : prev - 1;
            console.log('New index:', newIndex);
            return newIndex;
        });
    };

    const goToNext = () => {
        console.log('Next clicked, current index:', currentIndex);
        setCurrentIndex(prev => {
            const newIndex = prev === displayPhotos.length - 1 ? 0 : prev + 1;
            console.log('New index:', newIndex);
            return newIndex;
        });
    };

    console.log('Rendering carousel with photos:', displayPhotos.length, 'current index:', currentIndex);

    return (
        <div className={`photo-carousel ${className}`}>
            <div className="carousel-container">
                <img
                    src={displayPhotos[currentIndex]}
                    alt={`${altText} ${currentIndex + 1}`}
                    className="carousel-image"
                />
                
                {/* Debug info */}
                <div style={{
                    position: 'absolute',
                    top: '50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '5px',
                    borderRadius: '5px',
                    fontSize: '12px',
                    zIndex: 20
                }}>
                    {currentIndex + 1} / {displayPhotos.length}
                </div>
                
                {/* Navigation arrows - always show for testing */}
                <button 
                    className="carousel-arrow carousel-arrow-left" 
                    onClick={goToPrevious}
                    style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'red',
                        color: 'white',
                        border: 'none',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 15,
                        opacity: 1
                    }}
                >
                    LEFT
                </button>
                <button 
                    className="carousel-arrow carousel-arrow-right" 
                    onClick={goToNext}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'blue',
                        color: 'white',
                        border: 'none',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        zIndex: 15,
                        opacity: 1
                    }}
                >
                    RIGHT
                </button>
            </div>
        </div>
    );
};

export default SimplePhotoCarousel;