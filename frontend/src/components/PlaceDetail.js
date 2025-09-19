import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import userPreferences from '../utils/UserPreferences';
import './PlaceDetail.css';

const PlaceDetail = () => {
    const { placeId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [place, setPlace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Generate grey placeholder image data URL
    const getGreyPlaceholder = (width = 800, height = 400) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Fill with grey background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        
        // Add centered text
        ctx.fillStyle = '#999';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No Image Available', width / 2, height / 2);
        
        return canvas.toDataURL('image/png');
    };

    // Handle image load errors
    const handleImageError = (event) => {
        const img = event.target;
        if (!img.hasAttribute('data-fallback-attempted')) {
            img.setAttribute('data-fallback-attempted', 'true');
            img.src = getGreyPlaceholder();
        }
    };

    useEffect(() => {
        // Get place data from navigation state or fetch from activities
        const fetchPlaceData = () => {
            try {
                // Try to get place data from navigation state first
                const placeData = location.state?.place;
                const activityName = location.state?.activityName;
                
                if (placeData) {
                    setPlace({
                        ...placeData,
                        activityName: activityName
                    });
                    
                    // Check if user has liked this place before
                    const likedPlaces = userPreferences.getLikedPlaces();
                    const isPlaceLiked = likedPlaces.some(p => p.place_id === placeData.place_id);
                    setIsLiked(isPlaceLiked);
                    
                    // Always fetch additional details if we have a place_id but missing critical info
                    if (placeData.place_id && (!placeData.opening_hours || !placeData.reviews || !placeData.formatted_phone_number)) {
                        console.log('Fetching additional place details for:', placeData.name);
                        fetchPlaceDetailsFromBackend(placeData.place_id);
                    }
                    
                    setLoading(false);
                } else {
                    // Fallback: Try to find place in stored activities or use mock data
                    const storedActivities = JSON.parse(localStorage.getItem('recent_activities') || '[]');
                    let foundPlace = null;
                    
                    for (const activity of storedActivities) {
                        if (activity.places) {
                            foundPlace = activity.places.find(p => p.place_id === placeId || p.id === placeId);
                            if (foundPlace) {
                                foundPlace.activityName = activity.activity_name;
                                break;
                            }
                        }
                    }
                    
                    if (foundPlace) {
                        setPlace(foundPlace);
                        
                        // Check if user has liked this place
                        const likedPlaces = userPreferences.getLikedPlaces();
                        const isPlaceLiked = likedPlaces.some(p => p.place_id === foundPlace.place_id);
                        setIsLiked(isPlaceLiked);
                    } else {
                        // Use mock data as fallback
                        setPlace(getMockPlaceData(placeId));
                    }
                    
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error loading place data:', error);
                setPlace(getMockPlaceData(placeId));
                setLoading(false);
            }
        };

        fetchPlaceData();
    }, [placeId, location.state]);

    const fetchPlaceDetailsFromBackend = async (placeId) => {
        try {
            setLoadingDetails(true);
            console.log('Fetching place details from backend for place_id:', placeId);
            const response = await fetch(`http://localhost:8000/api/place-details/${placeId}/`);
            
            if (response.ok) {
                const detailedPlace = await response.json();
                console.log('Received place details:', detailedPlace);
                
                setPlace(prevPlace => {
                    const updatedPlace = {
                        ...prevPlace,
                        ...detailedPlace,
                        // Preserve existing data but prioritize new details
                        opening_hours: detailedPlace.opening_hours || prevPlace.opening_hours,
                        reviews: detailedPlace.reviews || prevPlace.reviews,
                        photos: detailedPlace.photos || prevPlace.photos,
                        formatted_phone_number: detailedPlace.formatted_phone_number || prevPlace.formatted_phone_number,
                        website: detailedPlace.website || prevPlace.website
                    };
                    
                    console.log('Updated place data:', updatedPlace);
                    return updatedPlace;
                });
            } else {
                console.error('Failed to fetch place details, status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching place details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const getMockPlaceData = (id) => {
        return {
            place_id: id,
            name: 'Mount Cinder Viewpoint',
            vicinity: 'Cascade Mountains, OR',
            description: 'Mount Cinder Viewpoint offers breathtaking panoramic views of the entire Cascade Mountain range, including the iconic peaks of Mount Hood and Mount Jefferson. It\'s a prime location for photography, bird watching, and enjoying serene sunsets. The well-maintained trail to the viewpoint is accessible for most skill levels, making it a popular spot for both casual visitors and avid hikers. The area here is crisp and clean, providing a refreshing escape from city life. Visitors often bring picnics to enjoy the natural beauty.',
            photos: [getGreyPlaceholder()],
            rating: 4.7,
            user_ratings_total: 53,
            opening_hours: {
                weekday_text: [
                    'Monday: 6:00 AM - 6:00 PM',
                    'Tuesday: 6:00 AM - 6:00 PM',
                    'Wednesday: 6:00 AM - 6:00 PM',
                    'Thursday: 6:00 AM - 6:00 PM',
                    'Friday: 9:00 AM - 8:00 PM',
                    'Saturday: 8:00 AM - 8:00 PM',
                    'Sunday: 8:00 AM - 6:00 PM'
                ]
            },
            formatted_address: '2500 Viewpoint Rd, Cascade Mountains, OR 97000',
            formatted_phone_number: '(555) 123-4567',
            website: 'mountcinderviewpoint.org',
            types: ['tourist_attraction', 'park'],
            activityName: 'park'
        };
    };

    const handleLikeToggle = () => {
        if (!place) return;
        
        try {
            if (isLiked) {
                // Unlike the place
                userPreferences.dislikePlace(place, place.activityName || 'general');
                setIsLiked(false);
            } else {
                // Like the place
                userPreferences.likePlace(place, place.activityName || 'general');
                setIsLiked(true);
            }
        } catch (error) {
            console.error('Error updating place preference:', error);
        }
    };

    const nextPhoto = () => {
        const photos = place.photos || [place.image];
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = () => {
        const photos = place.photos || [place.image];
        setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const goToPhoto = (index) => {
        setCurrentPhotoIndex(index);
    };

    const formatOpeningHours = () => {
        // If we have real opening hours data, use it
        if (place?.opening_hours?.weekday_text && place.opening_hours.weekday_text.length > 0) {
            return place.opening_hours.weekday_text.map(dayText => {
                const [day, ...hoursParts] = dayText.split(': ');
                return {
                    day: day,
                    hours: hoursParts.join(': ')
                };
            });
        }
        
        // If currently loading details, show loading message
        if (loadingDetails) {
            return [
                { day: 'Loading', hours: 'Fetching real opening hours...' }
            ];
        }
        
        // If no opening hours available and we have a place_id, try to fetch from backend
        if (place?.place_id && !place.opening_hours && !loadingDetails) {
            fetchPlaceDetailsFromBackend(place.place_id);
            return [
                { day: 'Loading', hours: 'Fetching opening hours...' }
            ];
        }
        
        // Final fallback if no data is available
        return [
            { day: 'Hours', hours: 'Opening hours not available' }
        ];
    };

    if (loading) {
        return <div className="loading">Loading place details...</div>;
    }

    if (!place) {
        return <div className="error">Place not found</div>;
    }

    return (
        <div className="place-detail">
            {/* Header */}
            <div className="place-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    ← Back to Dashboard
                </button>
                <div className="place-actions">
                    <button 
                        className={`favorite-btn ${isLiked ? 'liked' : ''}`}
                        onClick={handleLikeToggle}
                        title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isLiked ? '❤️' : '🤍'}
                    </button>
                    <button className="share-btn">📤</button>
                </div>
            </div>

            {/* Photo Gallery */}
            <div className="place-hero">
                <div className="photo-gallery">
                    <div className="main-photo">
                        <img 
                            src={place.photos?.[currentPhotoIndex] || place.image || getGreyPlaceholder()} 
                            alt={`${place.name} - Photo ${currentPhotoIndex + 1}`}
                            onError={handleImageError}
                        />
                        {place.photos && place.photos.length > 1 && (
                            <>
                                <button className="photo-nav prev" onClick={prevPhoto}>
                                    ‹
                                </button>
                                <button className="photo-nav next" onClick={nextPhoto}>
                                    ›
                                </button>
                                <div className="photo-counter">
                                    {currentPhotoIndex + 1} / {place.photos.length}
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Photo Thumbnails */}
                    {place.photos && place.photos.length > 1 && (
                        <div className="photo-thumbnails">
                            {place.photos.slice(0, 6).map((photo, index) => (
                                <img
                                    key={index}
                                    src={photo || getGreyPlaceholder(60, 60)}
                                    alt={`${place.name} thumbnail ${index + 1}`}
                                    className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                                    onClick={() => goToPhoto(index)}
                                    onError={handleImageError}
                                />
                            ))}
                            {place.photos.length > 6 && (
                                <div className="more-photos">
                                    +{place.photos.length - 6} more
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="place-content">
                <div className="place-title-section">
                    <h1>{place.name}</h1>
                    <p className="place-location">{place.vicinity || place.location || 'Location not specified'}</p>
                </div>

                {/* Overview */}
                <section className="overview-section">
                    <h2>Overview</h2>
                    <div className="about-section">
                        <h3>About This Place</h3>
                        <p>{place.description || 'A wonderful place to visit and explore.'}</p>
                    </div>
                </section>

                {/* Opening Hours */}
                <section className="hours-section">
                    <h3>Opening Hours</h3>
                    <div className="hours-grid">
                        {formatOpeningHours().map((dayInfo, index) => (
                            <div key={index} className="hours-row">
                                <span>{dayInfo.day}:</span>
                                <span>{dayInfo.hours}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact Information */}
                <section className="contact-section">
                    <h3>Contact Information</h3>
                    <div className="contact-info">
                        {(place.formatted_address || place.contact?.address) && (
                            <div className="contact-item">
                                <span className="contact-icon">📍</span>
                                <span>{place.formatted_address || place.contact.address}</span>
                            </div>
                        )}
                        {(place.formatted_phone_number || place.contact?.phone) && (
                            <div className="contact-item">
                                <span className="contact-icon">�</span>
                                <span>{place.formatted_phone_number || place.contact.phone}</span>
                            </div>
                        )}
                        {(place.website || place.contact?.website) && (
                            <div className="contact-item">
                                <span className="contact-icon">🌐</span>
                                <span>{place.website || place.contact.website}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Key Features */}
                <section className="features-section">
                    <h3>Key Features</h3>
                    <div className="features-list">
                        {(place.features || place.types || ['Restaurant', 'Outdoor Seating', 'Pet-friendly']).map((feature, index) => (
                            <span key={index} className="feature-tag">
                                {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                        ))}
                    </div>
                </section>

                {/* User Reviews */}
                <section className="reviews-section">
                    <div className="reviews-header">
                        <h3>User Reviews</h3>
                        <div className="reviews-summary">
                            <span className="rating-display">
                                ⭐ {place.rating || 4.0} ({place.user_ratings_total || place.reviews || 0} Reviews)
                            </span>
                            <button className="write-review-btn">✍️ Write a Review</button>
                        </div>
                    </div>
                    
                    <div className="reviews-list">
                        {(place.reviews && place.reviews.length > 0 ? place.reviews : [
                            {
                                author_name: 'Alex Johnson',
                                relative_time_description: '2 weeks ago',
                                rating: 5,
                                text: 'Great place! Highly recommend visiting.'
                            }
                        ]).map((review, index) => (
                            <div key={index} className="review-item">
                                <div className="review-header">
                                    <h4>{review.author_name}</h4>
                                    <span className="review-date">{review.relative_time_description}</span>
                                </div>
                                <div className="review-rating">
                                    {'⭐'.repeat(review.rating)}
                                </div>
                                <p className="review-comment">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PlaceDetail;