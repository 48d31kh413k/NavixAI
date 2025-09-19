import React, { useState, useEffect } from 'react';
import userPreferences from '../utils/UserPreferences';
import './Settings.css';

const Settings = ({ appSettings, updateAppSettings }) => {
    const defaultSettings = {
        activities: {
            outdoorAdventure: true,
            indoorRelaxation: true,
            culturalExploration: false,
            culinaryDelights: true
        },
        location: {
            recommendationRadius: 'Local Area (5km)',
            useCurrentLocation: true
        },
        units: {
            temperature: 'Celsius (°C)',
            distance: 'Kilometers (km)'
        }
    };

    const [preferences, setPreferences] = useState(() => {
        // Ensure we always have a valid preferences object
        if (appSettings && typeof appSettings === 'object') {
            return {
                ...defaultSettings,
                ...appSettings,
                // Ensure nested objects exist
                activities: { ...defaultSettings.activities, ...(appSettings.activities || {}) },
                location: { ...defaultSettings.location, ...(appSettings.location || {}) },
                units: { ...defaultSettings.units, ...(appSettings.units || {}) }
            };
        }
        return defaultSettings;
    });

    // Update local preferences when appSettings change
    useEffect(() => {
        if (appSettings && typeof appSettings === 'object') {
            setPreferences(prev => ({
                ...prev,
                ...appSettings,
                // Ensure nested objects exist
                activities: { ...prev.activities, ...(appSettings.activities || {}) },
                location: { ...prev.location, ...(appSettings.location || {}) },
                units: { ...prev.units, ...(appSettings.units || {}) }
            }));
        }
    }, [appSettings]);

    const [hasChanges, setHasChanges] = useState(false);

    const handleToggleChange = (category, key) => {
        try {
            const newPreferences = {
                ...preferences,
                [category]: {
                    ...preferences[category],
                    [key]: !preferences[category][key]
                }
            };
            setPreferences(newPreferences);
            
            // Update global app settings
            if (updateAppSettings) {
                updateAppSettings(newPreferences);
            }
            
            // Save to user preferences for activity-related settings
            if (category === 'activities') {
                const activityName = key;
                if (newPreferences[category][key]) {
                    userPreferences.likeActivity(activityName);
                } else {
                    userPreferences.dislikeActivity(activityName);
                }
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
        }
    };    const handleSelectChange = (category, key, value) => {
        const newPreferences = {
            ...preferences,
            [category]: {
                ...preferences[category],
                [key]: value
            }
        };
        setPreferences(newPreferences);
        
        // Update global app settings
        if (updateAppSettings) {
            updateAppSettings(newPreferences);
        }
    };    const handleSaveChanges = () => {
        userPreferences.updateSettings(preferences);
        setHasChanges(false);
        
        // Show success feedback
        const button = document.querySelector('.save-btn');
        const originalText = button.textContent;
        button.textContent = '✓ Saved!';
        button.style.background = '#4CAF50';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#ff6b35';
        }, 2000);
    };

    const handleCancel = () => {
        // Reload preferences from storage
        const userSettings = userPreferences.getSettings();
        setPreferences(prev => ({ ...prev, ...userSettings }));
        setHasChanges(false);
    };

    const ToggleSwitch = ({ checked, onChange, label, description }) => (
        <div className="setting-item">
            <div className="setting-info">
                <div className="setting-label">{label}</div>
                <div className="setting-description">{description}</div>
            </div>
            <div className={`toggle-switch ${checked ? 'active' : ''}`} onClick={onChange}>
                <div className="toggle-slider"></div>
            </div>
        </div>
    );

    const SelectDropdown = ({ value, onChange, options, label, description }) => (
        <div className="setting-item">
            <div className="setting-info">
                <div className="setting-label">{label}</div>
                <div className="setting-description">{description}</div>
            </div>
            <select 
                className="setting-select" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
        </div>
    );

    // Safety check to ensure preferences are properly initialized
    if (!preferences || !preferences.location) {
        return <div className="settings-loading">Loading preferences...</div>;
    }

    return (
        <div className="settings">
            {/* Settings Header with Navigation */}
            <div className="settings-nav-header">
                <div className="nav-breadcrumb">
                    <span className="breadcrumb-item">Dashboard</span>
                    <span className="breadcrumb-separator">&gt;</span>
                    <span className="breadcrumb-current">Preferences</span>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <input type="text" placeholder="Search activities or places..." />
                        <button className="search-btn">🔍</button>
                    </div>
                    <div className="user-profile">
                        <div className="user-avatar">👤</div>
                    </div>
                </div>
            </div>

            <div className="settings-header">
                <h1>User Preferences & Settings</h1>
                <p>Customize your experience and manage your account preferences.</p>
            </div>

            <div className="settings-content">
                {/* Activity Preferences */}
                <div className="settings-section">
                    <h3>Activity Preferences</h3>
                    <p className="section-description">
                        Customize the types of activities you'd like to receive recommendations for.
                    </p>
                    
                    <ToggleSwitch
                        checked={preferences.activities.outdoorAdventure}
                        onChange={() => handleToggleChange('activities', 'outdoorAdventure')}
                        label="Outdoor Adventure"
                        description="Activities like hiking, cycling, and kayaking."
                    />
                    
                    <ToggleSwitch
                        checked={preferences.activities.indoorRelaxation}
                        onChange={() => handleToggleChange('activities', 'indoorRelaxation')}
                        label="Indoor Relaxation"
                        description="Activities such as reading, board games, or crafting."
                    />
                    
                    <ToggleSwitch
                        checked={preferences.activities.culturalExploration}
                        onChange={() => handleToggleChange('activities', 'culturalExploration')}
                        label="Cultural Exploration"
                        description="Visits to museums, art galleries, and historical sites."
                    />
                    
                    <ToggleSwitch
                        checked={preferences.activities.culinaryDelights}
                        onChange={() => handleToggleChange('activities', 'culinaryDelights')}
                        label="Culinary Delights"
                        description="Recommendations for restaurants, cafes, and cooking courses."
                    />
                </div>

                {/* Location Preferences */}
                <div className="settings-section">
                    <h3>Location Preferences</h3>
                    <p className="section-description">
                        Define the geographical scope for your activity recommendations.
                    </p>
                    
                    <SelectDropdown
                        value={preferences?.location?.recommendationRadius || 'Local Area (5km)'}
                        onChange={(value) => handleSelectChange('location', 'recommendationRadius', value)}
                        options={['Local Area (5km)', 'City Wide (25km)', 'Regional (50km)', 'Extended (100km)']}
                        label="Recommendation Radius"
                        description="Select how far you're willing to travel for activities."
                    />
                </div>

                {/* Unit Preferences */}
                <div className="settings-section">
                    <h3>Unit Preferences</h3>
                    <p className="section-description">
                        Choose your preferred units for displaying weather and distance information.
                    </p>
                    
                    <SelectDropdown
                        value={preferences.units.temperature}
                        onChange={(value) => handleSelectChange('units', 'temperature', value)}
                        options={['Celsius (°C)', 'Fahrenheit (°F)']}
                        label="Temperature Unit"
                        description="Select your preferred temperature scale."
                    />
                    
                    <SelectDropdown
                        value={preferences.units.distance}
                        onChange={(value) => handleSelectChange('units', 'distance', value)}
                        options={['Kilometers (km)', 'Miles (mi)']}
                        label="Distance Unit"
                        description="Choose how distances should be displayed."
                    />
                </div>
            </div>

            {/* Action Buttons */}
            {hasChanges && (
                <div className="settings-actions">
                    <button className="cancel-btn" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button className="save-btn" onClick={handleSaveChanges}>
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default Settings;