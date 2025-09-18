import React, { useState, useEffect } from 'react';
import userPreferences from '../utils/UserPreferences';
import './UserHistory.css';

const UserHistory = () => {
    const [history, setHistory] = useState([]);
    const [likedPlaces, setLikedPlaces] = useState([]);
    const [preferredActivities, setPreferredActivities] = useState([]);
    const [activeTab, setActiveTab] = useState('history');
    const [settings, setSettings] = useState({});

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = () => {
        setHistory(userPreferences.getHistory());
        setLikedPlaces(userPreferences.getLikedPlaces());
        setPreferredActivities(userPreferences.getPreferredActivities());
        setSettings(userPreferences.getSettings());
    };

    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear your history? This cannot be undone.')) {
            userPreferences.clearHistory();
            loadUserData();
        }
    };

    const handleClearPreferences = () => {
        if (window.confirm('Are you sure you want to clear all preferences? This cannot be undone.')) {
            userPreferences.clearPreferences();
            loadUserData();
        }
    };

    const handleExportData = () => {
        const data = userPreferences.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `navix-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getActivityIcon = (activityName) => {
        const icons = {
            'restaurant': '🍽️', 'cafe': '☕', 'park': '🌳', 'museum': '🏛️',
            'shopping': '🛍️', 'cinema': '🎬', 'beach': '🏖️', 'gym': '💪',
            'library': '📚', 'hospital': '🏥', 'pharmacy': '💊', 'bank': '🏦',
            'gas_station': '⛽', 'tourist_attraction': '📸', 'amusement_park': '🎡',
            'zoo': '🦁', 'aquarium': '🐠', 'spa': '🧘', 'night_club': '🎵', 'bar': '🍺'
        };
        return icons[activityName] || '📍';
    };

    const formatTimeAgo = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    const renderHistory = () => (
        <div className="history-section">
            <div className="section-header">
                <h3>Recent Activity</h3>
                <button onClick={handleClearHistory} className="clear-btn">
                    Clear History
                </button>
            </div>
            
            {history.length === 0 ? (
                <div className="empty-state">
                    <p>No activity history yet.</p>
                    <p>Start exploring places to build your personalized recommendations!</p>
                </div>
            ) : (
                <div className="history-list">
                    {history.map((item) => (
                        <div key={item.id} className={`history-item ${item.action}`}>
                            <div className="history-icon">
                                {item.action === 'like' ? '❤️' : item.action === 'dislike' ? '👎' : '📍'}
                            </div>
                            
                            <div className="history-details">
                                <div className="place-name">{item.place.name}</div>
                                <div className="place-info">
                                    {getActivityIcon(item.activityType)} {item.activityType.replace(/_/g, ' ')}
                                    {item.place.vicinity && ` • ${item.place.vicinity}`}
                                </div>
                                <div className="action-text">
                                    {item.action === 'like' ? 'Liked this place' : 
                                     item.action === 'dislike' ? 'Disliked this place' : 'Visited'}
                                </div>
                            </div>
                            
                            <div className="history-time">
                                {formatTimeAgo(item.timestamp)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderLikedPlaces = () => (
        <div className="liked-places-section">
            <h3>Your Favorite Places</h3>
            
            {likedPlaces.length === 0 ? (
                <div className="empty-state">
                    <p>No favorite places yet.</p>
                    <p>Like places to see them here!</p>
                </div>
            ) : (
                <div className="places-grid">
                    {likedPlaces.map((place) => (
                        <div key={place.placeId} className="place-card">
                            <div className="place-header">
                                <h4>{place.name}</h4>
                                <div className="place-score">
                                    {'❤️'.repeat(Math.min(place.score, 5))}
                                    <span className="score-number">({place.score})</span>
                                </div>
                            </div>
                            
                            <div className="place-details">
                                <div className="place-activity">
                                    {getActivityIcon(place.activityType)} {place.activityType.replace(/_/g, ' ')}
                                </div>
                                {place.vicinity && (
                                    <div className="place-location">📍 {place.vicinity}</div>
                                )}
                                {place.rating && (
                                    <div className="place-rating">⭐ {place.rating}</div>
                                )}
                            </div>
                            
                            <div className="place-date">
                                Added {formatTimeAgo(place.timestamp)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderPreferences = () => (
        <div className="preferences-section">
            <h3>Activity Preferences</h3>
            
            {preferredActivities.length === 0 ? (
                <div className="empty-state">
                    <p>No activity preferences yet.</p>
                    <p>Your preferences will appear here as you interact with activities!</p>
                </div>
            ) : (
                <div className="preferences-list">
                    {preferredActivities.map((pref) => (
                        <div key={pref.activity} className="preference-item">
                            <div className="pref-icon">
                                {getActivityIcon(pref.activity)}
                            </div>
                            <div className="pref-name">
                                {pref.activity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                            <div className="pref-score">
                                <div className="score-bar">
                                    <div 
                                        className="score-fill" 
                                        style={{ width: `${(pref.score / 5) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="score-text">{pref.score}/5</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="preferences-actions">
                <button onClick={handleClearPreferences} className="clear-btn">
                    Reset All Preferences
                </button>
                <button onClick={handleExportData} className="export-btn">
                    Export Data
                </button>
            </div>
        </div>
    );

    return (
        <div className="user-history">
            <div className="history-header">
                <h2>Your Profile</h2>
                <p>Track your preferences and discover personalized recommendations</p>
            </div>

            <div className="tabs">
                <button 
                    className={activeTab === 'history' ? 'active' : ''}
                    onClick={() => setActiveTab('history')}
                >
                    Recent Activity
                </button>
                <button 
                    className={activeTab === 'favorites' ? 'active' : ''}
                    onClick={() => setActiveTab('favorites')}
                >
                    Favorite Places
                </button>
                <button 
                    className={activeTab === 'preferences' ? 'active' : ''}
                    onClick={() => setActiveTab('preferences')}
                >
                    Preferences
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'history' && renderHistory()}
                {activeTab === 'favorites' && renderLikedPlaces()}
                {activeTab === 'preferences' && renderPreferences()}
            </div>
        </div>
    );
};

export default UserHistory;