import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './MapComponent.css';

const MapComponent = ({ userLocation, places, currentPlace }) => {
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [map, setMap] = useState(null);

    const mapStyles = {
        height: '400px',
        width: '100%'
    };

    const defaultCenter = userLocation || { lat: 33.5731, lng: -7.5898 }; // Casablanca fallback

    const onLoad = useCallback((map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleMarkerClick = (place) => {
        setSelectedPlace(place);
        // Center map on selected place
        if (map && place.location) {
            map.panTo(place.location);
        }
    };

    const getUserLocationIcon = () => ({
        url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue" width="24" height="24">
                <circle cx="12" cy="12" r="8" fill="lightblue" stroke="blue" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="blue"/>
            </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24)
    });

    const getPlaceIcon = (place) => {
        const isCurrentPlace = currentPlace && place.place_id === currentPlace.place_id;
        const color = isCurrentPlace ? 'red' : 'green';
        
        return {
            url: 'data:image/svg+xml;base64,' + btoa(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32)
        };
    };

    return (
        <div className="map-container">
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={mapStyles}
                    zoom={13}
                    center={defaultCenter}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    options={{
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    }}
                >
                    {/* User location marker */}
                    {userLocation && (
                        <Marker
                            position={userLocation}
                            icon={getUserLocationIcon()}
                            title="Your Location"
                        />
                    )}

                    {/* Place markers */}
                    {places.map((place) => (
                        place.location && (
                            <Marker
                                key={place.place_id}
                                position={place.location}
                                icon={getPlaceIcon(place)}
                                title={place.name}
                                onClick={() => handleMarkerClick(place)}
                            />
                        )
                    ))}

                    {/* Info window for selected place */}
                    {selectedPlace && selectedPlace.location && (
                        <InfoWindow
                            position={selectedPlace.location}
                            onCloseClick={() => setSelectedPlace(null)}
                        >
                            <div className="info-window">
                                <h3>{selectedPlace.name}</h3>
                                <p>{