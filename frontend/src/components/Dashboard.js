import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import userPreferences from '../utils/UserPreferences';
import { convertTemperature, convertSpeed } from '../utils/UnitConverter';
import PhotoCarousel from './PhotoCarousel';
import './Dashboard.css';

const Dashboard = ({ appSettings }) => {
    const navigate = useNavigate();
    const [weatherData, setWeatherData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Activities');
    const [userPreferenceState, setUserPreferenceState] = useState({}); // Track preference state
    const [searchTerm, setSearchTerm] = useState('');

    // Handle preference updates to backend
    const updateUserPreference = async (place, preference) => {
        try {
            // Update local state immediately for UI feedback
            setUserPreferenceState(prev => ({
                ...prev,
                [place.place_id]: preference
            }));

            const response = await axios.post('http://localhost:8000/api/user-preference/', {
                place_id: place.place_id,
                place_name: place.name,
                activity_type: place.activity_name || place.type,
                preference: preference,
                user_id: 'anonymous' // You can implement proper user authentication later
            });
            
            if (response.data.success) {
                console.log(`Successfully ${preference}d place:`, place.name);
                // Also update local preferences for consistency
                if (preference === 'like') {
                    userPreferences.likeActivity(place.activity_name || place.name);
                } else {
                    userPreferences.dislikeActivity(place.activity_name || place.name);
                }
                // Force re-render to show updated preferences
                setActivities([...activities]);
            }
        } catch (error) {
            console.error(`Error updating ${preference} preference:`, error);
            // Still update local preferences as fallback
            if (preference === 'like') {
                userPreferences.likeActivity(place.activity_name || place.name);
            } else {
                userPreferences.dislikeActivity(place.activity_name || place.name);
            }
        }
    };

    const activityCategories = [
        'All Activities',
        'Outdoor Adventures', 
        'Relaxing Indoors',
        'Cultural Experiences',
        'Family Fun'
    ];

    // Transform backend activity data to show individual places with real names
    const transformActivitiesFromBackend = (backendActivities) => {
        const allPlaces = [];
        let placeId = 1;
        
        backendActivities.forEach((activity) => {
            if (activity.places && activity.places.length > 0) {
                activity.places.forEach((place) => {
                    allPlaces.push({
                        id: placeId++,
                        name: place.name || 'Unknown Place', // Real place name
                        category: mapActivityToCategory(activity.activity_name),
                        description: `${place.name} - ${place.vicinity || 'Great location to visit'}`,
                        photos: place.photos || [], // All photos array
                        rating: place.rating || 4.0,
                        reviews: place.user_ratings_total || 0,
                        duration: '1-3 hours',
                        difficulty: 'Easy',
                        activity_name: activity.activity_name,
                        place_count: 1,
                        places: [place], // The actual place data
                        place_id: place.place_id,
                        vicinity: place.vicinity,
                        types: place.types || []
                    });
                });
            }
        });
        
        return allPlaces;
    };

    // Map activity names to our frontend categories
    const mapActivityToCategory = (activityName) => {
        if (!activityName) return 'All Activities';
        
        console.log('Mapping activity to category:', activityName);
        
        const categoryMap = {
            // Outdoor Adventures
            'park': 'Outdoor Adventures',
            'hiking': 'Outdoor Adventures',
            'garden': 'Outdoor Adventures',
            'beach': 'Outdoor Adventures',
            'outdoor sports': 'Outdoor Adventures',
            'sports': 'Outdoor Adventures',
            'trail': 'Outdoor Adventures',
            
            // Indoor Relaxation
            'cafe': 'Relaxing Indoors',
            'spa': 'Relaxing Indoors',
            'library': 'Relaxing Indoors',
            'bookstore': 'Relaxing Indoors',
            'tea house': 'Relaxing Indoors',
            'cinema': 'Relaxing Indoors',
            
            // Cultural Exploration
            'museum': 'Cultural Experiences',
            'gallery': 'Cultural Experiences',
            'theater': 'Cultural Experiences',
            'historical': 'Cultural Experiences',
            'cultural center': 'Cultural Experiences',
            'art': 'Cultural Experiences',
            
            // Culinary Delights
            'restaurant': 'Family Fun',
            'food market': 'Family Fun',
            'bakery': 'Family Fun',
            'wine bar': 'Family Fun',
            'cooking': 'Family Fun',
            'market': 'Family Fun',
            
            // General
            'shopping': 'Family Fun',
            'mall': 'Family Fun'
        };
        
        const lowerActivity = activityName.toLowerCase();
        for (const [key, category] of Object.entries(categoryMap)) {
            if (lowerActivity.includes(key)) {
                console.log(`"${activityName}" -> "${category}" (matched "${key}")`);
                return category;
            }
        }
        
        console.log(`"${activityName}" -> "All Activities" (no match found)`);
        return 'All Activities';
    };

    useEffect(() => {
        fetchWeatherAndActivities();
    }, []);

    const fetchWeatherAndActivities = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    try {
                        console.log('Making API call to:', 'http://127.0.0.1:8000/api/activity-suggestion/');
                        console.log('With data:', { 
                            latitude, 
                            longitude, 
                            max_activities: 8,
                            activities: appSettings?.activities || {}
                        });
                        
                        // Fetch activities and weather data from the activity suggestion API
                        const activityResponse = await axios.post(
                            'http://127.0.0.1:8000/api/activity-suggestion/',
                            { 
                                latitude, 
                                longitude,
                                max_activities: 8,  // Get more activities for variety
                                activities: appSettings?.activities || {}  // Send user activity preferences
                            },
                            { 
                                headers: { 'Content-Type': 'application/json' } 
                            }
                        );
                        
                        console.log('API Response:', activityResponse.data);
                        
                        if (activityResponse.data && activityResponse.data.activities) {
                            console.log('Received activities from backend:', activityResponse.data.activities);
                            // Transform backend activities to match frontend format
                            const transformedActivities = transformActivitiesFromBackend(activityResponse.data.activities);
                            console.log('Transformed activities:', transformedActivities);
                            
                            // Debug: Check categories
                            const categoryCount = {};
                            transformedActivities.forEach(activity => {
                                const cat = activity.category;
                                categoryCount[cat] = (categoryCount[cat] || 0) + 1;
                            });
                            console.log('Activities by category:', categoryCount);
                            
                            // Sort activities by user preferences
                            const sortedActivities = userPreferences.sortActivitiesByPreference(transformedActivities);
                            setActivities(sortedActivities);
                            
                            // Set weather data from the same response
                            if (activityResponse.data.weather) {
                                setWeatherData(activityResponse.data.weather);
                            }
                        } else {
                            console.log('No activities in backend response:', activityResponse.data);
                            setActivities([]);
                        }
                    } catch (error) {
                        console.error('Activity fetch error:', error);
                        // Fallback to weather-only API if activity API fails
                        try {
                            const weatherResponse = await axios.post(
                                'http://127.0.0.1:8000/api/suggestions/',
                                { latitude, longitude },
                                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                            );
                            setWeatherData(weatherResponse.data);
                        } catch (weatherError) {
                            console.error('Weather fetch error:', weatherError);
                            // Mock weather data for demo
                            setWeatherData({
                                name: 'New York City',
                                main: { temp: 22, feels_like: 24, humidity: 65 },
                                weather: [{ description: 'sunny with clear skies', main: 'Clear' }],
                                wind: { speed: 10 },
                                visibility: 10000,
                                uv: { value: 6 }
                            });
                        }
                        
                        console.log('No activities received from backend, setting empty array');
                        setActivities([]);
                    }
                    setLoading(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    // Set fallback weather data and empty activities
                    setWeatherData({
                        name: 'Current Location',
                        main: { temp: 22, feels_like: 24, humidity: 65 },
                        weather: [{ description: 'sunny with clear skies', main: 'Clear' }],
                        wind: { speed: 10 },
                        visibility: 10000
                    });
                    setActivities([]);
                    setLoading(false);
                }
            );
        }
    };

    // Filter and sort activities with priority mixing
    const getFilteredAndSortedActivities = () => {
        let filtered = activities;
        
        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(activity => 
                activity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.vicinity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.activity_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filter by category (if specific category selected)
        if (selectedCategory !== 'All Activities') {
            filtered = filtered.filter(activity => activity.category === selectedCategory);
            // Sort by reviews if specific category
            return filtered.sort((a, b) => {
                return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
            });
        }
        
        // For "All Activities", create priority mixed list
        // First sort all activities by reviews within each category
        const sortedByCategory = {};
        filtered.forEach(activity => {
            const category = activity.category || 'Other';
            if (!sortedByCategory[category]) {
                sortedByCategory[category] = [];
            }
            sortedByCategory[category].push(activity);
        });
        
        // Sort each category by number of reviews
        Object.keys(sortedByCategory).forEach(category => {
            sortedByCategory[category].sort((a, b) => {
                return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
            });
        });
        
        // Create mixed priority list with balanced representation
        const mixedActivities = [];
        
        // Equal priority: 3 from each main category
        const familyFun = sortedByCategory['Family Fun'] || [];
        const relaxingIndoors = sortedByCategory['Relaxing Indoors'] || [];
        const culturalExperiences = sortedByCategory['Cultural Experiences'] || [];
        const outdoorAdventures = sortedByCategory['Outdoor Adventures'] || [];
        
        // Add 3 from each main category for balanced representation
        mixedActivities.push(...familyFun.slice(0, 3));
        mixedActivities.push(...relaxingIndoors.slice(0, 3));
        mixedActivities.push(...culturalExperiences.slice(0, 3));
        mixedActivities.push(...outdoorAdventures.slice(0, 3));
        
        // Add remaining activities from any other categories
        Object.keys(sortedByCategory).forEach(category => {
            if (!['Family Fun', 'Relaxing Indoors', 'Cultural Experiences', 'Outdoor Adventures'].includes(category)) {
                mixedActivities.push(...sortedByCategory[category].slice(0, 2));
            }
        });
        
        // Shuffle the mixed activities to avoid grouping by category
        const shuffled = [...mixedActivities];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled;
    };

    const getFilteredActivities = () => {
        // Use the new sorting function instead
        return getFilteredAndSortedActivities();
    };

    const getTemperature = (temp) => {
        if (!appSettings?.units?.temperature || !temp) return Math.round(temp);
        // Weather API returns Celsius, convert if needed
        const convertedTemp = convertTemperature(temp, 'Celsius (°C)', appSettings.units.temperature);
        return convertedTemp;
    };

    const getTemperatureUnit = () => {
        return appSettings?.units?.temperature === 'Fahrenheit (°F)' ? '°F' : '°C';
    };

    const getWindSpeed = () => {
        if (!weatherData?.wind?.speed) return 10;
        // Weather API returns m/s, convert to appropriate unit
        const speedInKmh = weatherData.wind.speed * 3.6; // Convert m/s to km/h
        if (appSettings?.units?.distance === 'Miles (mi)') {
            const speedInMph = convertSpeed(speedInKmh, 'Kilometers (km)', 'Miles (mi)');
            return Math.round(speedInMph);
        }
        return Math.round(speedInKmh);
    };

    const getSpeedUnit = () => {
        return appSettings?.units?.distance === 'Miles (mi)' ? 'mph' : 'km/h';
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading your personalized recommendations...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Top Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Dashboard</h1>
                    <div className="header-actions">
                        <div className="search-bar">
                            <input 
                                type="text" 
                                placeholder="Search activities or places..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="search-btn">🔍</button>
                        </div>
                        <div className="user-profile" onClick={() => navigate('/preferences')}>
                            <div className="user-avatar">👤</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weather Section */}
            <div className="weather-section">
                <h2>Current Weather & Conditions</h2>
                <div className="weather-main">
                    <div className="temperature">
                        <span className="temp-value">{getTemperature(weatherData?.main?.temp || 22)}{getTemperatureUnit()}</span>
                        <p className="weather-description">
                            {weatherData?.weather?.[0]?.description || 'Sunny with clear skies'}
                        </p>
                        <p className="location">{weatherData?.name || 'Current Location'} • Today, {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                    
                    <div className="weather-details">
                        <div className="weather-stat">
                            <span className="stat-label">Feels like</span>
                            <span className="stat-value">{getTemperature(weatherData?.main?.feels_like || 24)}{getTemperatureUnit()}</span>
                        </div>
                        <div className="weather-stat">
                            <span className="stat-label">Humidity</span>
                            <span className="stat-value">{weatherData?.main?.humidity || 65}%</span>
                        </div>
                        <div className="weather-stat">
                            <span className="stat-label">Wind</span>
                            <span className="stat-value">{getWindSpeed()} {getSpeedUnit()}</span>
                        </div>
                        <div className="weather-stat">
                            <span className="stat-label">UV Index</span>
                            <span className="stat-value">{weatherData?.uv?.value || 6} (High)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activities Section */}
            <div className="activities-section">
                <div className="section-header">
                    <h2>Recommended Activities</h2>
                    <div className="user-preferences-summary">
                        <span className="preferences-text">
                            {userPreferences.getPreferredActivities().length > 0 
                                ? `🎯 ${userPreferences.getPreferredActivities().length} preferences learned`
                                : "🔍 Building your preferences..."
                            }
                        </span>
                    </div>
                </div>
                
                {/* Category Filter */}
                <div className="filters-container">
                    <div className="category-filter">
                        <h3>Categories</h3>
                        {activityCategories.map(category => (
                            <button
                                key={category}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Activity Cards Grid */}
                <div className="activities-grid">
                    {getFilteredActivities().map(activity => (
                        <div key={activity.id} className="activity-card">
                            <div className="activity-image">
                                <PhotoCarousel 
                                    photos={(() => {
                                        const photos = activity.photos && activity.photos.length > 0 ? activity.photos : [];
                                        console.log(`Activity "${activity.name}" has ${photos.length} photos:`, photos);
                                        return photos;
                                    })()}
                                    altText={activity.name}
                                    className="activity-carousel"
                                />
                                <div className="activity-category">{activity.category}</div>
                                {(() => {
                                    const score = userPreferences.getActivityScore(activity.activity_name || activity.name);
                                    const preference = userPreferenceState[activity.place_id] || 
                                                     (score > 0 ? 'liked' : score < 0 ? 'disliked' : null);
                                    
                                    if (preference === 'liked') {
                                        return <div className="preference-indicator liked">❤️ Liked</div>;
                                    } else if (preference === 'disliked') {
                                        return <div className="preference-indicator disliked">👎 Disliked</div>;
                                    }
                                    return null;
                                })()}
                            </div>
                            <div className="activity-content">
                                <h3>{activity.name}</h3>
                                <p className="activity-description">{activity.description}</p>
                                <div className="activity-meta">
                                    <div className="rating">
                                        <span className="stars">
                                            {'★'.repeat(Math.floor(activity.rating))}
                                            {'☆'.repeat(5 - Math.floor(activity.rating))}
                                        </span>
                                        <span className="rating-text">
                                            {activity.rating} ({activity.reviews} reviews)
                                        </span>
                                    </div>
                                    <div className="activity-info">
                                        <span className="duration">{activity.duration}</span>
                                        <span className="difficulty">{activity.difficulty}</span>
                                    </div>
                                </div>
                                <div className="activity-actions">
                                    <div className="activity-preferences">
                                        <button 
                                            className="like-btn"
                                            onClick={() => updateUserPreference(activity, 'like')}
                                            title={`Like ${activity.name || activity.activity_name}`}
                                        >
                                            👍
                                        </button>
                                        <button 
                                            className="dislike-btn"
                                            onClick={() => updateUserPreference(activity, 'dislike')}
                                            title={`Dislike ${activity.name || activity.activity_name}`}
                                        >
                                            👎
                                        </button>
                                    </div>
                                    <button 
                                        className="view-details-btn"
                                        onClick={() => {
                                            // Store current activities in localStorage for place detail access
                                            localStorage.setItem('recent_activities', JSON.stringify(activities));
                                            
                                            // Navigate with the actual place data
                                            const place = activity.places[0]; // This is the actual place
                                            navigate(`/place/${activity.place_id || activity.id}`, {
                                                state: {
                                                    place: place,
                                                    activityName: activity.activity_name
                                                }
                                            });
                                        }}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preferences Reminder */}
            <div className="preferences-cta">
                <h3>Refine Your Recommendations</h3>
                <p>Update your preferences to get even better activity suggestions tailored just for you.</p>
                <button className="goto-preferences-btn">Go to Preferences</button>
            </div>
        </div>
    );
};

export default Dashboard;