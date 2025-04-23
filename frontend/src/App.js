import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

// Defining the main App component
function App() {
    // State to store the data fetched from the backend
    const [data, setData] = useState(null);

    // State to track whether the data is still loading
    const [loading, setLoading] = useState(true);

    // State to store any error that occurs during the data fetch
    const [error, setError] = useState(null);

    // useEffect hook to fetch data from the backend when the component mounts
    useEffect(() => {
        // Making a GET request to the backend API
        axios.get('http://127.0.0.1:8000/api/test/')
            .then(response => {
                // Setting the fetched data to the state
                setData(response.data);

                // Indicating that loading is complete
                setLoading(false);
            })
            .catch(error => {
                // Setting the error to the state if the request fails
                setError(error);

                // Indicating that loading is complete even if there is an error
                setLoading(false);
            });
    }, []); // Empty dependency array ensures this runs only once when the component mounts
    useEffect(() => {
        fetchUserLocation();
    }, []);
    // If the data is still loading, display a loading message
    if (loading) return <div>Loading...</div>;

    // If there is an error, display the error message
    if (error) return <div>Error: {error.message}</div>;

    // Returning the main JSX structure of the app
    return (
        // Wrapping the app in a Router to enable routing
        <Router>
            <div>
                {/* Header section with navigation links */}
                <header>
                    <nav>
                        {/* Link to the home route */}
                        <Link to="/">Home</Link>
                    </nav>
                </header>

                {/* Defining the routes for the app */}
                <Routes>
                    {/* Route for the home page */}
                    <Route path="/" element={
                        <div>
                            {/* Displaying a welcome message */}
                            <h1>Welcome to the React Frontend</h1>

                            {/* Displaying the message from the backend response */}
                            <p>Backend Response: {data?.message}</p>
                        </div>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

// Exporting the App component as the default export
export default App;

const fetchUserLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log("User coordinates:", latitude, longitude);
                sendCoordinatesToBackend(latitude, longitude);
            },
            (error) => {
                console.error("Error fetching location:", error);
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
};



const sendCoordinatesToBackend = async (latitude, longitude) => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/suggestions/', {
            latitude,
            longitude,
        });
        console.log("Backend response:", response.data);
    } catch (error) {
        console.error("Error sending coordinates:", error);
    }
};

