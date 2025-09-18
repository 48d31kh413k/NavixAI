import React, { useState } from 'react';
import './ActivitySelector.css';

const ActivitySelector = ({ activities, onActivitySelect, userPreferences = {} }) => {
    const [selectedActivities, setSelectedActivities] = useState(new Set());

    const handleActivityToggle = (activityName) => {
        const newSelected = new Set(selectedActivities);
        
        if (newSelected.has(activityName)) {
            newSelected.delete(activityName);
        } else {
            newSelected.add(activityName);
        }
        
        setSelectedActivities(newSelected);
        onActivitySelect(Array.from(newSelected));
    };

    const getActivityIcon = (activityName) => {
        const icons = {
            'restaurant': '🍽️',
            'cafe': '☕',
            'park': '🌳',
            'museum': '🏛️',
            'shopping': '🛍️',
            'cinema': '🎬',
            'beach': '🏖️',
            'gym': '💪',
            'library': '📚',
            'hospital': '🏥',
            'pharmacy': '💊',
            'bank': '🏦',
            'gas_station': '⛽',
            'tourist_attraction': '📸',
            'amusement_park': '🎡',
            'zoo': '🦁',
            'aquarium': '🐠',
            'spa': '🧘',
            'night_club': '🎵',
            'bar': '🍺'
        };
        return icons[activityName] || '📍';
    };

    const getPreferenceScore = (activityName) => {
        return userPreferences[activityName] || 0;
    };

    const getPreferenceText = (score) => {
        if (score >= 3) return 'Loved';
        if (score >= 1) return 'Liked';
        if (score <= -3) return 'Disliked';
        if (score <= -1) return 'Not preferred';
        return 'New';
    };

    const getPreferenceColor = (score) => {
        if (score >= 3) return '#4CAF50';
        if (score >= 1) return '#8BC34A';
        if (score <= -3) return '#f44336';
        if (score <= -1) return '#FF9800';
        return '#9E9E9E';
    };

    return (
        <div className="activity-selector">
            <h3>Choose Your Preferred Activities</h3>
            <p className="selector-subtitle">Select activities you're interested in today</p>
            
            <div className="activities-grid">
                {activities.map((activity, index) => {
                    const isSelected = selectedActivities.has(activity.activity_name);
                    const preferenceScore = getPreferenceScore(activity.activity_name);
                    const preferenceText = getPreferenceText(preferenceScore);
                    const preferenceColor = getPreferenceColor(preferenceScore);
                    
                    return (
                        <div
                            key={index}
                            className={`activity-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleActivityToggle(activity.activity_name)}
                        >
                            <div className="activity-icon">
                                {getActivityIcon(activity.activity_name)}
                            </div>
                            
                            <div className="activity-info">
                                <h4 className="activity-name">
                                    {activity.activity_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </h4>
                                
                                <p className="activity-count">
                                    {activity.place_count} places found
                                </p>
                                
                                <div 
                                    className="preference-badge"
                                    style={{ backgroundColor: preferenceColor }}
                                >
                                    {preferenceText}
                                </div>
                            </div>
                            
                            <div className="selection-indicator">
                                {isSelected ? '✓' : '+'}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {selectedActivities.size > 0 && (
                <div className="selection-summary">
                    <p>Selected {selectedActivities.size} activities</p>
                    <div className="selected-list">
                        {Array.from(selectedActivities).map(activity => (
                            <span key={activity} className="selected-tag">
                                {getActivityIcon(activity)} {activity.replace(/_/g, ' ')}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivitySelector;