import React, { useState } from 'react';
import './PhotoCarousel.css';

const PhotoCarousel = ({ photos = [], altText = "Place photo", className = "" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Generate grey placeholder image data URL
    const getGreyPlaceholder = (width = 400, height = 200) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Fill with grey background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        
        // Add centered text
        ctx.fillStyle = '#999';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No Image Available', width / 2, height / 2);
        
        return canvas.toDataURL('image/png');
    };

    // Handle image load errors
    const handleImageError = (event) => {
        const img = event.target;
        if (img.src !== getGreyPlaceholder() && !img.hasAttribute('data-fallback-attempted')) {
            img.setAttribute('data-fallback-attempted', 'true');
            img.src = getGreyPlaceholder();
        }
    };

    // Use placeholder if no photos available
    const displayPhotos = photos && photos.length > 0 ? photos : [getGreyPlaceholder()];

    const goToPrevious = (e) => {
        e.stopPropagation(); // Prevent triggering parent click events
        setCurrentIndex(currentIndex === 0 ? displayPhotos.length - 1 : currentIndex - 1);
    };

    const goToNext = (e) => {
        e.stopPropagation(); // Prevent triggering parent click events
        setCurrentIndex(currentIndex === displayPhotos.length - 1 ? 0 : currentIndex + 1);
    };

    const goToSlide = (index, e) => {
        e.stopPropagation(); // Prevent triggering parent click events
        setCurrentIndex(index);
    };

    return (
        <div className={`photo-carousel ${className}`}>
            <div className="carousel-container">
                <img
                    src={displayPhotos[currentIndex]}
                    alt={`${altText} ${currentIndex + 1}`}
                    className="carousel-image"
                    onError={handleImageError}
                />
                
                {/* Navigation arrows - only show if more than 1 photo */}
                {displayPhotos.length > 1 && (
                    <>
                        <button 
                            className="carousel-arrow carousel-arrow-left" 
                            onClick={goToPrevious}
                            aria-label="Previous photo"
                        >
                            &#8249;
                        </button>
                        <button 
                            className="carousel-arrow carousel-arrow-right" 
                            onClick={goToNext}
                            aria-label="Next photo"
                        >
                            &#8250;
                        </button>
                    </>
                )}
                
                {/* Photo indicators - only show if more than 1 photo */}
                {displayPhotos.length > 1 && (
                    <div className="carousel-indicators">
                        {displayPhotos.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                                onClick={(e) => goToSlide(index, e)}
                                aria-label={`Go to photo ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
                
                {/* Photo counter */}
                {displayPhotos.length > 1 && (
                    <div className="photo-counter">
                        {currentIndex + 1} / {displayPhotos.length}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoCarousel;