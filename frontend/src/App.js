import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import UserHistory from './components/UserHistory';
import PlaceDetail from './components/PlaceDetail';
import UserPreferences from './components/UserPreferences';
import './App.css';

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true); // Add sidebar state
    const [appSettings, setAppSettings] = useState({
        units: {
            temperature: 'Celsius (°C)',
            distance: 'Kilometers (km)'
        },
        activities: {
            outdoorAdventure: true,
            indoorRelaxation: true,
            culturalExploration: false,
            culinaryDelights: true
        },
        location: {
            recommendationRadius: 'Local Area (5km)',
            useCurrentLocation: true
        }
    });

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Load settings from localStorage on app start
    useEffect(() => {
        const savedSettings = localStorage.getItem('navix_app_settings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                setAppSettings(parsedSettings);
            } catch (error) {
                console.error('Error loading app settings:', error);
            }
        }
    }, []);

    // Save settings to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('navix_app_settings', JSON.stringify(appSettings));
    }, [appSettings]);

    const updateAppSettings = (newSettings) => {
        setAppSettings(prev => ({
            ...prev,
            ...newSettings
        }));
    };

    return (
        <BrowserRouter>
            <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                {/* Hamburger Menu Button */}
                <button 
                    className="hamburger-menu" 
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                
                <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                    <Routes>
                        <Route path="/" element={<Dashboard appSettings={appSettings} />} />
                        <Route path="/settings" element={<Settings appSettings={appSettings} updateAppSettings={updateAppSettings} />} />
                        <Route path="/user-preferences" element={<UserPreferences />} />
                        <Route path="/history" element={<UserHistory />} />
                        <Route path="/place/:placeId" element={<PlaceDetail />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;