import React, { useState, useEffect } from 'react';
import userPreferences from '../utils/UserPreferences';
import './Settings.css';

const Settings = ({ appSettings, updateAppSettings }) => {
    const [preferences, setPreferences] = useState(appSettings || {
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
        notifications: {
            weatherAlerts: true,
            newRecommendations: true,
            dailyDigest: false
        },
        units: {
            temperature: 'Celsius (°C)',
            distance: 'Kilometers (km)'
        },
        privacy: {
            shareData: false,
            analytics: true
        }
    });

    // Update local preferences when appSettings change
    useEffect(() => {
        if (appSettings) {
            setPreferences(appSettings);
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

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and will remove all your data.')) {
            userPreferences.clearPreferences();
            userPreferences.clearHistory();
            alert('Account data has been deleted.');
        }
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
                        value={preferences.location.recommendationRadius}
                        onChange={(value) => handleSelectChange('location', 'recommendationRadius', value)}
                        options={['Local Area (5km)', 'City Wide (25km)', 'Regional (50km)', 'Extended (100km)']}
                        label="Recommendation Radius"
                        description="Select how far you're willing to travel for activities."
                    />
                </div>

                {/* Notification Settings */}
                <div className="settings-section">
                    <h3>Notification Settings</h3>
                    <p className="section-description">
                        Manage how and when you receive updates from WeatherWise Explorer.
                    </p>
                    
                    <ToggleSwitch
                        checked={preferences.notifications.weatherAlerts}
                        onChange={() => handleToggleChange('notifications', 'weatherAlerts')}
                        label="Weather Alerts"
                        description="Get notifications for significant weather changes."
                    />
                    
                    <ToggleSwitch
                        checked={preferences.notifications.newRecommendations}
                        onChange={() => handleToggleChange('notifications', 'newRecommendations')}
                        label="New Recommendations"
                        description="Receive alerts for new activity recommendations based on your preferences."
                    />
                    
                    <ToggleSwitch
                        checked={preferences.notifications.dailyDigest}
                        onChange={() => handleToggleChange('notifications', 'dailyDigest')}
                        label="Daily Digest"
                        description="Get a daily summary of weather and recommended activities."
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

                {/* Data & Privacy */}
                <div className="settings-section">
                    <h3>Data & Privacy</h3>
                    <p className="section-description">
                        Manage your account data and privacy settings.
                    </p>
                    
                    <ToggleSwitch
                        checked={preferences.privacy.shareData}
                        onChange={() => handleToggleChange('privacy', 'shareData')}
                        label="Share Usage Data"
                        description="Help improve the app by sharing anonymous usage statistics."
                    />
                    
                    <ToggleSwitch
                        checked={preferences.privacy.analytics}
                        onChange={() => handleToggleChange('privacy', 'analytics')}
                        label="Analytics"
                        description="Allow collection of analytics data to improve recommendations."
                    />

                    <div className="danger-zone">
                        <h4>Danger Zone</h4>
                        <p>Permanent actions that cannot be undone.</p>
                        <button className="delete-account-btn" onClick={handleDeleteAccount}>
                            Delete My Account
                        </button>
                    </div>
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