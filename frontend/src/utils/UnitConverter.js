// Unit conversion utilities
export const convertTemperature = (temp, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return temp;
    
    // Convert from Celsius to Fahrenheit
    if (fromUnit === 'Celsius (°C)' && toUnit === 'Fahrenheit (°F)') {
        return Math.round((temp * 9/5) + 32);
    }
    
    // Convert from Fahrenheit to Celsius  
    if (fromUnit === 'Fahrenheit (°F)' && toUnit === 'Celsius (°C)') {
        return Math.round((temp - 32) * 5/9);
    }
    
    return temp;
};

export const convertDistance = (distance, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return distance;
    
    // Convert from kilometers to miles
    if (fromUnit === 'Kilometers (km)' && toUnit === 'Miles (mi)') {
        return Math.round(distance * 0.621371 * 100) / 100;
    }
    
    // Convert from miles to kilometers
    if (fromUnit === 'Miles (mi)' && toUnit === 'Kilometers (km)') {
        return Math.round(distance * 1.60934 * 100) / 100;
    }
    
    return distance;
};

export const formatTemperature = (temp, unit) => {
    const symbol = unit === 'Celsius (°C)' ? '°C' : '°F';
    return `${temp}${symbol}`;
};

export const formatDistance = (distance, unit) => {
    const symbol = unit === 'Kilometers (km)' ? 'km' : 'mi';
    return `${distance} ${symbol}`;
};

export const convertSpeed = (speed, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return speed;
    
    // Convert from m/s to mph
    if (fromUnit === 'Kilometers (km)' && toUnit === 'Miles (mi)') {
        return Math.round(speed * 2.237 * 100) / 100;
    }
    
    // Convert from mph to m/s
    if (fromUnit === 'Miles (mi)' && toUnit === 'Kilometers (km)') {
        return Math.round(speed * 0.447 * 100) / 100;
    }
    
    return speed;
};

export const formatSpeed = (speed, unit) => {
    const symbol = unit === 'Kilometers (km)' ? 'km/h' : 'mph';
    return `${speed} ${symbol}`;
};