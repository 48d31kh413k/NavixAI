/**
 * Unit Conversion Utilities for NavixAI
 * 
 * This module provides comprehensive unit conversion functions to support
 * international users with different measurement preferences. It handles
 * temperature, distance, and speed conversions with proper precision and
 * formatting for display in the user interface.
 * 
 * Supported Conversions:
 * - Temperature: Celsius ↔ Fahrenheit
 * - Distance: Kilometers ↔ Miles  
 * - Speed: m/s ↔ mph (for wind speed)
 * 
 * Design Principles:
 * - Precise mathematical conversions with appropriate rounding
 * - Consistent formatting for UI display
 * - Graceful handling of edge cases and invalid inputs
 * - Support for user preference-based unit selection
 * 
 * Usage Examples:
 * - convertTemperature(25, 'Celsius (°C)', 'Fahrenheit (°F)') → 77
 * - convertDistance(5.2, 'Kilometers (km)', 'Miles (mi)') → 3.23
 * - formatTemperature(25, 'Celsius (°C)') → "25°C"
 */

/**
 * Convert temperature between Celsius and Fahrenheit.
 * 
 * Performs precise temperature conversion using standard formulas:
 * - Celsius to Fahrenheit: (C × 9/5) + 32
 * - Fahrenheit to Celsius: (F - 32) × 5/9
 * 
 * @param {number} temp - Temperature value to convert
 * @param {string} fromUnit - Source unit ('Celsius (°C)' or 'Fahrenheit (°F)')
 * @param {string} toUnit - Target unit ('Celsius (°C)' or 'Fahrenheit (°F)')
 * @returns {number} Converted temperature rounded to nearest whole number
 * 
 * @example
 * convertTemperature(0, 'Celsius (°C)', 'Fahrenheit (°F)') // Returns 32
 * convertTemperature(100, 'Fahrenheit (°F)', 'Celsius (°C)') // Returns 38
 */
export const convertTemperature = (temp, fromUnit, toUnit) => {
    // No conversion needed if units are the same
    if (fromUnit === toUnit) return temp;
    
    // Celsius to Fahrenheit conversion
    if (fromUnit === 'Celsius (°C)' && toUnit === 'Fahrenheit (°F)') {
        return Math.round((temp * 9/5) + 32);
    }
    
    // Fahrenheit to Celsius conversion  
    if (fromUnit === 'Fahrenheit (°F)' && toUnit === 'Celsius (°C)') {
        return Math.round((temp - 32) * 5/9);
    }
    
    // Return original value if conversion not supported
    return temp;
};

/**
 * Convert distance between kilometers and miles.
 * 
 * Performs precise distance conversion using standard conversion factors:
 * - Kilometers to Miles: km × 0.621371
 * - Miles to Kilometers: mi × 1.60934
 * 
 * Results are rounded to 2 decimal places for practical display.
 * 
 * @param {number} distance - Distance value to convert
 * @param {string} fromUnit - Source unit ('Kilometers (km)' or 'Miles (mi)')
 * @param {string} toUnit - Target unit ('Kilometers (km)' or 'Miles (mi)')
 * @returns {number} Converted distance rounded to 2 decimal places
 * 
 * @example
 * convertDistance(10, 'Kilometers (km)', 'Miles (mi)') // Returns 6.21
 * convertDistance(5, 'Miles (mi)', 'Kilometers (km)') // Returns 8.05
 */
export const convertDistance = (distance, fromUnit, toUnit) => {
    // No conversion needed if units are the same
    if (fromUnit === toUnit) return distance;
    
    // Kilometers to Miles conversion
    if (fromUnit === 'Kilometers (km)' && toUnit === 'Miles (mi)') {
        return Math.round(distance * 0.621371 * 100) / 100;
    }
    
    // Miles to Kilometers conversion
    if (fromUnit === 'Miles (mi)' && toUnit === 'Kilometers (km)') {
        return Math.round(distance * 1.60934 * 100) / 100;
    }
    
    // Return original value if conversion not supported
    return distance;
};

/**
 * Format temperature value with appropriate unit symbol.
 * 
 * Creates user-friendly temperature displays by appending the correct
 * temperature symbol (°C or °F) to the numeric value.
 * 
 * @param {number} temp - Temperature value to format
 * @param {string} unit - Unit type ('Celsius (°C)' or 'Fahrenheit (°F)')
 * @returns {string} Formatted temperature string with unit symbol
 * 
 * @example
 * formatTemperature(25, 'Celsius (°C)') // Returns "25°C"
 * formatTemperature(77, 'Fahrenheit (°F)') // Returns "77°F"
 */
export const formatTemperature = (temp, unit) => {
    const symbol = unit === 'Celsius (°C)' ? '°C' : '°F';
    return `${temp}${symbol}`;
};

/**
 * Format distance value with appropriate unit abbreviation.
 * 
 * Creates user-friendly distance displays by appending the correct
 * distance abbreviation (km or mi) to the numeric value.
 * 
 * @param {number} distance - Distance value to format
 * @param {string} unit - Unit type ('Kilometers (km)' or 'Miles (mi)')
 * @returns {string} Formatted distance string with unit abbreviation
 * 
 * @example
 * formatDistance(5.2, 'Kilometers (km)') // Returns "5.2 km"
 * formatDistance(3.23, 'Miles (mi)') // Returns "3.23 mi"
 */
export const formatDistance = (distance, unit) => {
    const symbol = unit === 'Kilometers (km)' ? 'km' : 'mi';
    return `${distance} ${symbol}`;
};

/**
 * Convert wind speed from m/s to mph.
 * 
 * Converts wind speed measurements from meters per second (typical in weather APIs)
 * to miles per hour (more familiar to users in some regions). Uses the conversion
 * factor: m/s × 2.237 ≈ mph
 * 
 * @param {number} speed - Wind speed in source unit
 * @param {string} fromUnit - Source unit (currently assumes m/s equivalent)
 * @param {string} toUnit - Target unit (currently assumes mph equivalent)
 * @returns {number} Converted speed rounded to 2 decimal places
 * 
 * @example
 * convertSpeed(10, 'Kilometers (km)', 'Miles (mi)') // Returns 22.37 (m/s to mph)
 */
export const convertSpeed = (speed, fromUnit, toUnit) => {
    // No conversion needed if units are the same
    if (fromUnit === toUnit) return speed;
    
    // Convert from m/s to mph (approximate conversion using km/mi factor)
    if (fromUnit === 'Kilometers (km)' && toUnit === 'Miles (mi)') {
        return Math.round(speed * 2.237 * 100) / 100;
    }
    
    // Convert from mph to m/s (reverse conversion)
    if (fromUnit === 'Miles (mi)' && toUnit === 'Kilometers (km)') {
        return Math.round(speed * 0.447 * 100) / 100;
    }
    
    // Return original value if conversion not supported
    return speed;
};

/**
 * Format speed value with appropriate unit abbreviation.
 * 
 * Creates user-friendly speed displays for wind speed measurements
 * by appending the correct speed unit abbreviation.
 * 
 * @param {number} speed - Speed value to format
 * @param {string} unit - Unit type ('Kilometers (km)' for km/h or 'Miles (mi)' for mph)
 * @returns {string} Formatted speed string with unit abbreviation
 * 
 * @example
 * formatSpeed(15, 'Kilometers (km)') // Returns "15 km/h"
 * formatSpeed(10, 'Miles (mi)') // Returns "10 mph"
 */
export const formatSpeed = (speed, unit) => {
    const symbol = unit === 'Kilometers (km)' ? 'km/h' : 'mph';
    return `${speed} ${symbol}`;
};