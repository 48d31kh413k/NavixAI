import React from 'react';
import './WeatherBanner.css';

const WeatherBanner = ({ weatherData }) => {
    if (!weatherData) return null;

    const getWeatherIcon = (iconCode) => {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    };

    const getTemperatureColor = (temp) => {
        if (temp <= 0) return '#4A90E2';
        if (temp <= 10) return '#5BC0DE';
        if (temp <= 20) return '#5CB85C';
        if (temp <= 30) return '#F0AD4E';
        return '#D9534F';
    };

    return (
        <div className="weather-banner">
            <div className="weather-content">
                <div className="location-info">
                    <h2>📍 {weatherData.name}</h2>
                    <p>{weatherData.sys?.country}</p>
                </div>
                
                <div className="weather-main">
                    <div className="weather-icon">
                        <img 
                            src={getWeatherIcon(weatherData.weather[0].icon)} 
                            alt={weatherData.weather[0].description}
                        />
                    </div>
                    
                    <div className="temperature">
                        <span 
                            className="temp-value"
                            style={{ color: getTemperatureColor(weatherData.main.temp) }}
                        >
                            {Math.round(weatherData.main.temp)}°C
                        </span>
                        <p className="weather-description">
                            {weatherData.weather[0].description}
                        </p>
                    </div>
                </div>
                
                <div className="weather-details">
                    <div className="detail-item">
                        <span className="detail-label">Feels like</span>
                        <span className="detail-value">{Math.round(weatherData.main.feels_like)}°C</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Humidity</span>
                        <span className="detail-value">{weatherData.main.humidity}%</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Wind</span>
                        <span className="detail-value">{weatherData.wind?.speed} m/s</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherBanner;