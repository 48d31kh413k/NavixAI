import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SwipeCards from './components/SwipeCards';
import MapComponent from './components/MapComponent';
import WeatherBanner from './components/WeatherBanner';
import './App.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [activityData, setActivityData] = useState(null);
    const [places, setPlaces] = useState([]);
    const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
    const [userLocation, setUserLocation] = useState(null);

    // Test backend connection
    useEffect(() => {
        axios.get(`${API_BASE_URL}/test/`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, []);

    // Get user location and fetch suggestions
    useEffect(() => {
        const fetchUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setUserLocation({ lat: latitude, lng: longitude });
                        
                        try {
                            // Fetch activity suggestions with places
                            const response = await axios.post(
                                `${API_BASE_URL}/activity-suggestion/`,
                                { latitude, longitude },
                                { headers: { 'Content-Type': 'application/json' } }
                            );
                            
                            setActivityData(response.data);
                            setWeatherData(response.data.weather);
                            setPlaces(response.data.places || []);
                        } catch (err) {
                            setLocationError('Failed to get suggestions');
                            console.error("API error:", err);
                        }
                    },
                    (error) => {
                        setLocationError('Location access denied');
                        console.error("Geolocation error:", error);
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            } else {
                setLocationError('Geolocation not supported');
            }
        };

        fetchUserLocation();
    }, []);

    const handleSwipe = async (direction, place) => {
        const action = direction === 'right' ? 'like' : 'dislike';
        
        try {
            // Record user interaction
            await axios.post(
                `${API_BASE_URL}/record-interaction/`,
                { place_id: place.place_id, action },
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            // Move to next place
            setCurrentPlaceIndex(prevIndex => prevIndex + 1);
            
            // If we've gone through all places, fetch new suggestions
            if (currentPlaceIndex >= places.length - 1) {
                fetchNewSuggestions();
            }
        } catch (error) {
            console.error("Error recording interaction:", error);
        }
    };

    const fetchNewSuggestions = async () => {
        if (!userLocation) return;
        
        try {
            const response = await axios.post(
                `${API_BASE_URL}/activity-suggestion/`,
                { latitude: userLocation.lat, longitude: userLocation.lng },
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            setActivityData(response.data);
            setPlaces(response.data.places || []);
            setCurrentPlaceIndex(0);
        } catch (error) {
            console.error("Error fetching new suggestions:", error);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error.message}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <Router>
            <div className="app">
                <header className="app-header">
                    <h1>Navix</h1>
                    <p>Discover activities near you</p>
                </header>

                <Routes>
                    <Route path="/" element={
                        <div className="main-content">
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
                                        <WeatherBanner weatherData={weatherData} />
                                    )}
                                    
                                    {activityData && (
                                        <div className="activity-banner">
                                            <h2>Suggested Activity: {activityData.activity}</h2>
                                        </div>
                                    )}
                                    
                                    <div className="content-container">
                                        <div className="swipe-section">
                                            {places.length > 0 ? (
                                                <SwipeCards
                                                    places={places}
                                                    currentIndex={currentPlaceIndex}
                                                    onSwipe={handleSwipe}
                                                    onNewSuggestions={fetchNewSuggestions}
                                                />
                                            ) : (
                                                <div className="no-places">
                                                    <p>No places found. Try refreshing!</p>
                                                    <button onClick={fetchNewSuggestions}>
                                                        Get New Suggestions
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="map-section">
                                            {userLocation && places.length > 0 && (
                                                <MapComponent
                                                    userLocation={userLocation}
                                                    places={places}
                                                    currentPlace={places[currentPlaceIndex]}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;