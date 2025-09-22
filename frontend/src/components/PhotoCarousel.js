import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PhotoCarousel.css';

const PhotoCarousel = ({ photos = [], altText = "Place photo", className = "" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

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
    
    console.log('PhotoCarousel render:', { 
        photos: photos?.length || 0, 
        displayPhotos: displayPhotos.length, 
        currentIndex 
    });

    const goToPrevious = useCallback((e) => {
        console.log('goToPrevious called', e);
        if (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent triggering parent click events
        }
        setCurrentIndex(prev => {
            const newIndex = prev === 0 ? displayPhotos.length - 1 : prev - 1;
            console.log('Previous: currentIndex', prev, '-> newIndex', newIndex);
            return newIndex;
        });
    }, [displayPhotos.length]);

    const goToNext = useCallback((e) => {
        console.log('goToNext called', e);
        if (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent triggering parent click events
        }
        setCurrentIndex(prev => {
            const newIndex = prev === displayPhotos.length - 1 ? 0 : prev + 1;
            console.log('Next: currentIndex', prev, '-> newIndex', newIndex);
            return newIndex;
        });
    }, [displayPhotos.length]);

    const goToSlide = (index, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent triggering parent click events
        }
        setCurrentIndex(index);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Only handle keyboard events if the carousel is focused or its children are focused
            if (!carouselRef.current || !carouselRef.current.contains(document.activeElement)) {
                return;
            }

            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    goToNext();
                    break;
                case 'Home':
                    event.preventDefault();
                    setCurrentIndex(0);
                    break;
                case 'End':
                    event.preventDefault();
                    setCurrentIndex(displayPhotos.length - 1);
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [displayPhotos.length, goToNext, goToPrevious]);

    return (
        <div 
            ref={carouselRef}
            className={`photo-carousel ${className}`}
            tabIndex="0"
            role="img"
            aria-label={`${altText} carousel, photo ${currentIndex + 1} of ${displayPhotos.length}`}
        >
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
                            onMouseDown={(e) => e.preventDefault()}
                            aria-label="Previous photo"
                            type="button"
                        >
                            &#8249;
                        </button>
                        <button 
                            className="carousel-arrow carousel-arrow-right" 
                            onClick={goToNext}
                            onMouseDown={(e) => e.preventDefault()}
                            aria-label="Next photo"
                            type="button"
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
                                onMouseDown={(e) => e.preventDefault()}
                                aria-label={`Go to photo ${index + 1}`}
                                type="button"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoCarousel;