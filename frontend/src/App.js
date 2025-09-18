import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import ActivitySelector from './components/ActivitySelector';
import UserHistory from './components/UserHistory';
import userPreferences from './utils/UserPreferences';
import './App.css';

function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [activities, setActivities] = useState([]);
    const [selectedActivities, setSelectedActivities] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [userPrefs, setUserPrefs] = useState({});

    // Load user preferences on app start
    useEffect(() => {
        const prefs = {};
        const preferredActivities = userPreferences.getPreferredActivities();
        preferredActivities.forEach(pref => {
            prefs[pref.activity] = pref.score;
        });
        setUserPrefs(prefs);
    }, []);

    // Fetch test data from backend
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/test/')
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, []);

    // Fetch activity suggestion with personalization
    const fetchActivitySuggestion = async (latitude, longitude) => {
        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/activity-suggestion/',
                { 
                    latitude, 
                    longitude, 
                    max_activities: 8 // Get more activities for better selection
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            let activitiesData = response.data.activities || [];
            console.log('Activities received:', activitiesData);
            
            // Sort by user preferences
            activitiesData = userPreferences.sortActivitiesByPreference(activitiesData);
            
            setActivities(activitiesData);
            setCurrentLocation({ latitude, longitude });
        } catch (error) {
            console.error("Failed to fetch activities:", error);
            setLocationError('Failed to fetch activities');
        }
    };

    // Handle activity selection
    const handleActivitySelection = (selectedActivityNames) => {
        setSelectedActivities(selectedActivityNames);
        
        // Record user's activity preferences
        selectedActivityNames.forEach(activityName => {
            userPreferences.likeActivity(activityName);
        });
        
        // Update local preferences state
        const updatedPrefs = { ...userPrefs };
        selectedActivityNames.forEach(activityName => {
            updatedPrefs[activityName] = userPreferences.getActivityScore(activityName);
        });
        setUserPrefs(updatedPrefs);
    };

    // Handle place interactions
    const handlePlaceLike = (place, activityType) => {
        userPreferences.likePlace(place, activityType);
        
        // Update preferences state
        const updatedPrefs = { ...userPrefs };
        updatedPrefs[activityType] = userPreferences.getActivityScore(activityType);
        setUserPrefs(updatedPrefs);
    };

    const handlePlaceDislike = (place, activityType) => {
        userPreferences.dislikePlace(place, activityType);
        
        // Update preferences state
        const updatedPrefs = { ...userPrefs };
        updatedPrefs[activityType] = userPreferences.getActivityScore(activityType);
        setUserPrefs(updatedPrefs);
    };

    // Fetch user location, weather, and activity suggestion
    useEffect(() => {
        const fetchUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            const weatherResponse = await axios.post(
                                'http://127.0.0.1:8000/api/suggestions/', 
                                { latitude, longitude },
                                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                            );
                            setWeatherData(weatherResponse.data);
                            
                            await fetchActivitySuggestion(latitude, longitude);
                        } catch (err) {
                            setLocationError('Failed to get weather data');
                            console.error("API error:", err);
                        }
                    },
                    (error) => {
                        setLocationError('Location access denied');
                        console.error("Geolocation error:", error);
                    }
                );
            } else {
                setLocationError('Geolocation not supported');
            }
        };

        fetchUserLocation();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <BrowserRouter>
            <div className="app">
                <header className="app-header">
                    <nav className="nav-bar">
                        <div className="nav-brand">
                            <h1>Navix</h1>
                            <p>Discover activities near you</p>
                        </div>
                        <div className="nav-links">
                            <Link to="/" className="nav-link">🏠 Explore</Link>
                            <Link to="/history" className="nav-link">👤 Profile</Link>
                        </div>
                    </nav>
                </header>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={
                            <div>
                                {locationError ? (
                                    <div className="error-message">
                                        <h2>Location Error</h2>
                                        <p>{locationError}</p>
                                        <button onClick={() => window.location.reload()}>
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {weatherData && (
                                            <div className="weather-banner">
                                                <h3>Current Weather</h3>
                                                <div className="weather-info">
                                                    <span className="weather-location">📍 {weatherData.name}</span>
                                                    <span className="weather-temp">{weatherData.main?.temp}°C</span>
                                                    <span className="weather-desc">{weatherData.weather?.[0]?.description}</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {activities && activities.length > 0 && (
                                            <>
                                                <ActivitySelector
                                                    activities={activities}
                                                    onActivitySelect={handleActivitySelection}
                                                    userPreferences={userPrefs}
                                                />
                                                
                                                {selectedActivities.length > 0 && (
                                                    <div className="selected-activities-display">
                                                        <h3>Your Selected Activities</h3>
                                                        <div className="activity-places">
                                                            {activities
                                                                .filter(activity => selectedActivities.includes(activity.activity_name))
                                                                .map((activity, index) => (
                                                                <div key={index} className="activity-section">
                                                                    <h4>{activity.activity_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                                                                    <div className="places-list">
                                                                        {activity.places?.slice(0, 3).map((place, placeIndex) => (
                                                                            <div key={placeIndex} className="place-item">
                                                                                <div className="place-info">
                                                                                    <h5>{place.name}</h5>
                                                                                    <p>{place.vicinity}</p>
                                                                                    {place.rating && <span>⭐ {place.rating}</span>}
                                                                                </div>
                                                                                <div className="place-actions">
                                                                                    <button 
                                                                                        onClick={() => handlePlaceLike(place, activity.activity_name)}
                                                                                        className="like-btn"
                                                                                    >
                                                                                        ❤️
                                                                                    </button>
                                                                                    <button 
                                                                                        onClick={() => handlePlaceDislike(place, activity.activity_name)}
                                                                                        className="dislike-btn"
                                                                                    >
                                                                                        👎
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {userPreferences.getPreferredActivities().length > 0 && (
                                                    <div className="personalization-notice">
                                                        <p>🎯 Suggestions personalized based on your preferences!</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        
                                        {!activities.length && !locationError && (
                                            <div className="loading-activities">
                                                <p>🔍 Finding activities near you...</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        } />
                        
                        <Route path="/history" element={<UserHistory />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;