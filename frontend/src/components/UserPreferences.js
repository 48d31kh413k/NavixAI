import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import userPreferences from '../utils/UserPreferences';
import './UserPreferences.css';

const UserPreferences = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [likedPlaces, setLikedPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load liked places when component mounts or when route changes
    useEffect(() => {
        const loadLikedPlaces = () => {
            const liked = userPreferences.getLikedPlaces();
            setLikedPlaces(liked);
            setLoading(false);
        };
        loadLikedPlaces();
        
        // Also reload when the component becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadLikedPlaces();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [location]);

    if (loading) {
        return <div className="loading">Loading preferences...</div>;
    }

    return (
        <div className="user-preferences">
            <div className="preferences-header">
                <button 
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
                <h1>Your Preferences</h1>
            </div>

            <div className="preferences-content">
                {/* Liked Places */}
                <div className="preference-section">
                    <h2>❤️ Liked Places ({likedPlaces.length})</h2>
                    {likedPlaces.length === 0 ? (
                        <div className="empty-state">
                            <p>No liked places yet. Start exploring and like places you enjoy!</p>
                        </div>
                    ) : (
                        <div className="places-grid">
                            {likedPlaces.map(place => (
                                <div key={place.placeId} className="place-card liked">
                                    <div className="place-info">
                                        <h3 className="place-name">{place.name}</h3>
                                        <p className="place-vicinity">{place.vicinity}</p>
                                        <div className="place-meta">
                                            <span className="place-rating">
                                                {'★'.repeat(Math.floor(place.rating || 0))}
                                                {'☆'.repeat(5 - Math.floor(place.rating || 0))}
                                                {place.rating && ` ${place.rating}`}
                                            </span>
                                            <span className="place-category">{place.activityType}</span>
                                        </div>
                                        <span className="liked-date">
                                            Liked: {new Date(place.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="place-actions">
                                        <span className="liked-indicator">❤️</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserPreferences;