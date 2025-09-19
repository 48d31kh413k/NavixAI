import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import userPreferences from '../utils/UserPreferences';
import './UserPreferences.css';

const UserPreferences = () => {
    const navigate = useNavigate();
    const [preferences, setPreferences] = useState({ liked: [], disliked: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserPreferences();
    }, []);

    const fetchUserPreferences = async () => {
        try {
            // Get preferences from backend
            const response = await axios.get('http://localhost:8000/api/user-preferences/');
            
            if (response.data.success) {
                setPreferences(response.data.preferences);
            } else {
                // Fallback to local preferences
                const liked = userPreferences.getLikedPlaces();
                const disliked = userPreferences.getDislikedPlaces();
                setPreferences({ liked, disliked });
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
            // Fallback to local preferences
            const liked = userPreferences.getLikedPlaces();
            const disliked = userPreferences.getDislikedPlaces();
            setPreferences({ liked, disliked });
        } finally {
            setLoading(false);
        }
    };

    const removePreference = async (placeId, preferenceType) => {
        try {
            await axios.delete(`http://localhost:8000/api/user-preference/${placeId}/`);
            
            // Update local state
            setPreferences(prev => ({
                ...prev,
                [preferenceType]: prev[preferenceType].filter(item => item.place_id !== placeId)
            }));
            
            // Also update local preferences
            if (preferenceType === 'liked') {
                const place = preferences.liked.find(p => p.place_id === placeId);
                if (place) userPreferences.dislikePlace(place, place.activity_type);
            } else {
                const place = preferences.disliked.find(p => p.place_id === placeId);
                if (place) userPreferences.likePlace(place, place.activity_type);
            }
        } catch (error) {
            console.error('Error removing preference:', error);
        }
    };

    const clearAllPreferences = async () => {
        if (window.confirm('Are you sure you want to clear all preferences?')) {
            try {
                await axios.delete('http://localhost:8000/api/user-preferences/');
                setPreferences({ liked: [], disliked: [] });
                userPreferences.clearAllPreferences();
            } catch (error) {
                console.error('Error clearing preferences:', error);
                // Still clear local preferences
                userPreferences.clearAllPreferences();
                setPreferences({ liked: [], disliked: [] });
            }
        }
    };

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
                <button 
                    className="clear-all-btn"
                    onClick={clearAllPreferences}
                >
                    Clear All
                </button>
            </div>

            <div className="preferences-content">
                {/* Liked Places */}
                <div className="preference-section">
                    <h2>❤️ Liked Places ({preferences.liked.length})</h2>
                    {preferences.liked.length === 0 ? (
                        <div className="empty-state">
                            <p>No liked places yet. Start exploring and like places you enjoy!</p>
                        </div>
                    ) : (
                        <div className="preferences-grid">
                            {preferences.liked.map((place) => (
                                <div key={place.place_id} className="preference-card liked">
                                    <div className="place-image">
                                        <img 
                                            src={place.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
                                            alt={place.place_name || place.name}
                                        />
                                    </div>
                                    <div className="place-info">
                                        <h3>{place.place_name || place.name}</h3>
                                        <p className="activity-type">{place.activity_type}</p>
                                        <p className="timestamp">
                                            Liked on {new Date(place.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="preference-actions">
                                        <button 
                                            className="remove-btn"
                                            onClick={() => removePreference(place.place_id, 'liked')}
                                            title="Remove from liked"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Disliked Places */}
                <div className="preference-section">
                    <h2>👎 Disliked Places ({preferences.disliked.length})</h2>
                    {preferences.disliked.length === 0 ? (
                        <div className="empty-state">
                            <p>No disliked places.</p>
                        </div>
                    ) : (
                        <div className="preferences-grid">
                            {preferences.disliked.map((place) => (
                                <div key={place.place_id} className="preference-card disliked">
                                    <div className="place-image">
                                        <img 
                                            src={place.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
                                            alt={place.place_name || place.name}
                                        />
                                    </div>
                                    <div className="place-info">
                                        <h3>{place.place_name || place.name}</h3>
                                        <p className="activity-type">{place.activity_type}</p>
                                        <p className="timestamp">
                                            Disliked on {new Date(place.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="preference-actions">
                                        <button 
                                            className="remove-btn"
                                            onClick={() => removePreference(place.place_id, 'disliked')}
                                            title="Remove from disliked"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="preferences-stats">
                <div className="stat-card">
                    <h3>Preference Summary</h3>
                    <p>Total Liked: {preferences.liked.length}</p>
                    <p>Total Disliked: {preferences.disliked.length}</p>
                    <p>Total Interactions: {preferences.liked.length + preferences.disliked.length}</p>
                </div>
            </div>
        </div>
    );
};

export default UserPreferences;