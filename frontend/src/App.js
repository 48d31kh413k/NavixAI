import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [activity, setActivity] = useState(null);

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

    // Fetch activity suggestion
    const fetchActivitySuggestion = async (latitude, longitude) => {
        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/activity-suggestion/',
                { latitude, longitude },
                { headers: { 'Content-Type': 'application/json' } }
            );
            setActivity(response.data.activity);
        } catch (error) {
            console.error("Failed to fetch activity:", error);
            setActivity('park');  // Fallback
        }
    };

    // Fetch user location, weather, and activity suggestion
    useEffect(() => {
        const fetchUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            // Fetch weather data
                            const weatherResponse = await axios.post(
                                'http://127.0.0.1:8000/api/suggestions/', 
                                { latitude, longitude },
                                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                            );
                            setWeatherData(weatherResponse.data);
                            
                            // Then fetch activity suggestion
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
        <Router>
            <div>
                <header>
                    <nav>
                        <Link to="/">Home</Link>
                    </nav>
                </header>

                <Routes>
                    <Route path="/" element={
                        <div>
                            <h1>Welcome to the React Frontend</h1>
                            <p>Backend Response: {data?.message}</p>
                            
                            {locationError ? (
                                <div style={{ color: 'red', marginTop: '20px' }}>
                                    Location Error: {locationError}
                                </div>
                            ) : weatherData ? (
                                <div style={{ marginTop: '20px' }}>
                                    <h2>Weather Information</h2>
                                    <pre>{JSON.stringify(weatherData, null, 2)}</pre>
                                    
                                    {activity && (
                                        <div style={{ marginTop: '20px' }}>
                                            <h2>Suggested Activity</h2>
                                            <p>{activity.charAt(0).toUpperCase() + activity.slice(1)}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ marginTop: '20px' }}>
                                    Loading weather data...
                                </div>
                            )}
                        </div>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;