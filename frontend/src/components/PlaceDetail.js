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

    const getMockPlaceData = (id) => {
        return {
            place_id: id,
            name: 'Mount Cinder Viewpoint',
            vicinity: 'Cascade Mountains, OR',
            description: 'Mount Cinder Viewpoint offers breathtaking panoramic views of the entire Cascade Mountain range, including the iconic peaks of Mount Hood and Mount Jefferson. It\'s a prime location for photography, bird watching, and enjoying serene sunsets. The well-maintained trail to the viewpoint is accessible for most skill levels, making it a popular spot for both casual visitors and avid hikers. The area here is crisp and clean, providing a refreshing escape from city life. Visitors often bring picnics to enjoy the natural beauty.',
            photos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'],
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

    const formatOpeningHours = () => {
        if (!place?.opening_hours?.weekday_text) {
            return [
                { day: 'Monday', hours: '6:00 AM - 6:00 PM' },
                { day: 'Tuesday', hours: '6:00 AM - 6:00 PM' },
                { day: 'Wednesday', hours: '6:00 AM - 6:00 PM' },
                { day: 'Thursday', hours: '6:00 AM - 6:00 PM' },
                { day: 'Friday', hours: '9:00 AM - 8:00 PM' },
                { day: 'Saturday', hours: '8:00 AM - 8:00 PM' },
                { day: 'Sunday', hours: '8:00 AM - 6:00 PM' }
            ];
        }
        
        return place.opening_hours.weekday_text.map(dayText => {
            const [day, ...hoursParts] = dayText.split(': ');
            return {
                day: day,
                hours: hoursParts.join(': ')
            };
        });
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

            {/* Hero Image */}
            <div className="place-hero">
                <img 
                    src={place.photos?.[0] || place.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'} 
                    alt={place.name} 
                />
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
                        {(place.userReviews || [
                            {
                                id: 1,
                                author: 'Alex Johnson',
                                date: 'April 15, 2024',
                                rating: 5,
                                comment: 'Great place! Highly recommend visiting.'
                            }
                        ]).map((review) => (
                            <div key={review.id} className="review-item">
                                <div className="review-header">
                                    <h4>{review.author}</h4>
                                    <span className="review-date">{review.date}</span>
                                </div>
                                <div className="review-rating">
                                    {'⭐'.repeat(review.rating)}
                                </div>
                                <p className="review-comment">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PlaceDetail;