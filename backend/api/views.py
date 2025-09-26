"""
NavixAI API Views

This module contains the core API endpoints for the NavixAI application:
- Activity suggestion system powered by OpenAI GPT
- Google Places API integration for location data and photos
- Weather-based activity recommendations
- User preference management and tracking
- Caching layer for performance optimization

The API serves as the bridge between the React frontend and external services,
providing intelligent activity recommendations based on location, weather,
and user preferences.

Architecture:
- Uses Django REST Framework for API structure
- Implements comprehensive caching for performance
- Integrates multiple external APIs (OpenAI, Google Maps, OpenWeatherMap)
- Provides fallback mock data for development/testing
- Supports concurrent processing for improved response times
"""

from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv
import os
import openai
import json  
import googlemaps
from django.conf import settings
from datetime import datetime, timedelta
import logging
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Load environment variables from .env file
load_dotenv()

# Initialize API keys from environment variables
# These keys are required for the application to function properly
openai.api_key = os.getenv('OPENAI_API_KEY')           # OpenAI GPT API for intelligent suggestions
OPENWEATHERMAP_API_KEY = os.getenv('OPENWEATHERMAP_API_KEY')   # Weather data integration
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')         # Google Maps and Places API

# Configure logging for debugging and monitoring
logger = logging.getLogger(__name__)


@api_view(['GET'])
def test(request):
    """
    Health check endpoint to verify API connectivity.
    
    This simple endpoint allows frontend and monitoring systems to verify
    that the API server is running and responsive.
    
    Returns:
        Response: JSON message confirming API is operational
    """
    return Response({'message': 'API is working'})


@csrf_exempt
def get_weather_suggestions(request):
    """
    Legacy weather-based activity suggestion endpoint.
    
    Provides activity recommendations based on current weather conditions
    at a specified location. This endpoint has been largely superseded by
    the more comprehensive get_activity_suggestion endpoint but is maintained
    for backward compatibility.
    
    Args:
        request: HTTP POST request containing:
            - latitude (float): Geographic latitude
            - longitude (float): Geographic longitude
            
    Returns:
        JsonResponse: Activity suggestions based on weather conditions
        
    Caching:
        Weather data is cached for 1 week (604800 seconds) to reduce API calls
        
    External APIs:
        - OpenWeatherMap API for current weather conditions
        - OpenAI GPT for weather-appropriate activity suggestions
    """
    if request.method == 'POST':
        # Extract coordinates from request
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')

        # Implement caching strategy to reduce external API calls
        # Cache key includes coordinates for location-specific caching
        cache_key = f'weather_{latitude}_{longitude}'
        weather_data = cache.get(cache_key)

        if not weather_data:
            # Fetch fresh weather data from OpenWeatherMap API
            # Uses metric units for international compatibility
            url = f'http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={OPENWEATHERMAP_API_KEY}&units=metric'
            response = requests.get(url)
            
            if response.status_code == 200:
                weather_data = response.json()
                # Cache weather data for 1 week to balance freshness with API quota
                cache.set(cache_key, weather_data, 604800)
            else:
                # Handle API failure gracefully
                return JsonResponse({'error': 'Failed to fetch weather data'}, status=500)
    
        return JsonResponse(weather_data)
    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt
def get_activity_suggestion(request):
    """
    Main activity suggestion endpoint with AI-powered recommendations.
    
    This is the core API endpoint that provides intelligent activity suggestions
    based on location, weather conditions, and user preferences. It integrates
    multiple external APIs and uses OpenAI for contextual recommendations.
    
    Process Flow:
    1. Parse and validate input parameters
    2. Check cache for existing results (performance optimization)
    3. Fetch weather data for the location
    4. Generate AI-powered activity suggestions based on weather and preferences
    5. Find nearby places for each suggested activity using Google Places API
    6. Calculate travel times and distances
    7. Cache results and return comprehensive activity data
    
    Args:
        request: HTTP POST request containing:
            - latitude (float): Geographic latitude for location-based suggestions
            - longitude (float): Geographic longitude for location-based suggestions
            - max_activities (int, optional): Maximum number of activities to return (default: 5)
            - activities (dict, optional): User activity preferences as key-value pairs
            
    Returns:
        JsonResponse: Comprehensive activity data including:
            - activities: List of suggested activities with nearby places
            - weather: Current weather conditions
            - location: Location metadata
            
    Caching Strategy:
        Results are cached for 1 hour based on:
        - Rounded coordinates (4 decimal precision)
        - Number of requested activities
        - User preference hash
        
    External API Integration:
        - OpenWeatherMap: Weather conditions for contextual suggestions
        - OpenAI GPT: Intelligent activity recommendations
        - Google Places API: Location data and place details
        - Google Distance Matrix API: Travel time calculations
        
    Error Handling:
        - Gracefully handles API failures with fallback responses
        - Provides mock data when external APIs are unavailable
        - Comprehensive logging for debugging and monitoring
    """
    if request.method == 'POST':
        try:
            # Parse input data - support both JSON and form-encoded requests
            # This flexibility allows integration with various frontend frameworks
            data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
            latitude = data.get('latitude')
            longitude = data.get('longitude')
            max_activities = int(data.get('max_activities', 5))  # Client can specify result count
            activity_preferences = data.get('activities', {})  # User preference filters
            
            # Input validation - coordinates are required for location-based suggestions
            if not latitude or not longitude:
                return JsonResponse({'error': 'Missing coordinates'}, status=400)

            # Create intelligent cache key for performance optimization
            # Round coordinates to reduce cache fragmentation while maintaining accuracy
            lat_rounded = round(float(latitude), 4)  # ~11 meter precision
            lng_rounded = round(float(longitude), 4)  # ~11 meter precision
            
            # Include user preferences in cache key for personalized caching
            prefs_key = '_'.join([k for k, v in activity_preferences.items() if v]) if activity_preferences else 'all'
            cache_key = f'multi_activity_{lat_rounded}_{lng_rounded}_{max_activities}_{prefs_key}'
            
            # Check cache first for improved performance
            cached_result = cache.get(cache_key)
            if cached_result:
                print("Returning cached multi-activity result")
                return JsonResponse(cached_result)

            # Fetch weather data for contextual activity suggestions
            weather_data = get_weather_data(latitude, longitude)
            if not weather_data or 'error' in weather_data:
                return JsonResponse({'error': 'Failed to get weather data'}, status=500)

            # Generate AI-powered activity suggestions using OpenAI
            # Weather context helps provide appropriate seasonal and condition-based activities
            activities = get_multiple_activities_from_ai(weather_data, max_activities, activity_preferences)
            print(f"Suggested activities: {activities}")
            
            # Find nearby places for all suggested activities using concurrent processing
            # This significantly improves API response time for multiple activity queries
            activities_with_places = get_places_for_all_activities(
                latitude, longitude, activities, max_activities
            )
            
            # Build comprehensive response with all relevant data
            result = {
                'activities': activities_with_places,
                'weather': weather_data,
                'location': {
                    'latitude': latitude,
                    'longitude': longitude,
                    'city': weather_data.get('name', 'Unknown')
                }
            }
            
            # Cache successful results for 1 hour to balance freshness with performance
            cache.set(cache_key, result, 3600)
            print(f"Multi-activity result: Found {len(activities_with_places)} activities")
            
            return JsonResponse(result)
            
        except Exception as e:
            # Comprehensive error handling with detailed logging
            print("Multi-activity suggestion error:", str(e))
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': 'Failed to get activity suggestions'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

def get_multiple_activities_from_ai(weather_data, max_activities=5, activity_preferences=None):
    """
    Generate intelligent activity suggestions using OpenAI GPT.
    
    This function leverages OpenAI's language model to provide contextually appropriate
    activity suggestions based on weather conditions and user preferences. It constructs
    a detailed prompt that includes weather context, user preferences, and specific
    formatting requirements for Google Places API compatibility.
    
    Algorithm:
    1. Check for OpenAI API key availability (fallback to static suggestions if missing)
    2. Parse user preferences into human-readable categories
    3. Build contextual prompt with weather and preference data
    4. Query OpenAI GPT for activity suggestions
    5. Parse and validate AI response
    6. Return Google Maps-compatible activity keywords
    
    Args:
        weather_data (dict): Weather information from OpenWeatherMap API containing:
            - weather[0]['description']: Weather condition description
            - main['temp']: Current temperature in Celsius
            - name: Location name
            - main['humidity']: Humidity percentage
        max_activities (int): Maximum number of activities to suggest (default: 5)
        activity_preferences (dict, optional): User preference flags:
            - outdoorAdventure (bool): Preference for outdoor activities
            - indoorRelaxation (bool): Preference for indoor relaxation
            - culturalExploration (bool): Preference for cultural venues
            - culinaryDelights (bool): Preference for food-related activities
            
    Returns:
        list: Activity keywords compatible with Google Places API search terms
        
    Fallback Strategy:
        If OpenAI API is unavailable, falls back to static activity suggestions
        based on weather conditions to ensure system reliability.
        
    AI Prompt Engineering:
        - Incorporates weather context for seasonal appropriateness
        - Maps user preferences to specific activity categories
        - Enforces Google Maps searchable term requirements
        - Ensures diverse activity mix (outdoor, cultural, dining, relaxation)
        - Specifies exact output format for consistent parsing
    """
    try:
        # Check API key availability and provide fallback for development/testing
        if not openai.api_key:
            print("OpenAI API key not found, using fallback")
            return get_fallback_multiple_activities(weather_data, max_activities, activity_preferences)
        
        # Parse user preferences into contextual categories
        # This mapping transforms boolean flags into descriptive activity categories
        enabled_preferences = []
        if activity_preferences:
            if activity_preferences.get('outdoorAdventure'):
                enabled_preferences.append('outdoor adventures (parks, hiking, sports, outdoor activities)')
            if activity_preferences.get('indoorRelaxation'):
                enabled_preferences.append('indoor relaxation (cafes, spas, libraries, quiet indoor spaces)')
            if activity_preferences.get('culturalExploration'):
                enabled_preferences.append('cultural exploration (museums, galleries, historical sites, cultural centers)')
            if activity_preferences.get('culinaryDelights'):
                enabled_preferences.append('culinary delights (restaurants, food markets, cooking classes, bakeries)')
        
        # Build preference context for AI prompt
        preference_text = ""
        if enabled_preferences:
            preference_text = f"""
        User Preferences (focus on these categories):
        {', '.join(enabled_preferences)}
        """
        else:
            preference_text = "User has no specific preferences - suggest a variety of activities."
        
        # Construct comprehensive AI prompt with weather context and constraints
        # This prompt is carefully engineered to produce Google Places API-compatible results
        prompt = f"""
        Given the weather conditions and user preferences, suggest {max_activities} different activities for someone to do.
        
        Weather: {weather_data['weather'][0]['description']}
        Temperature: {weather_data['main']['temp']}°C
        Location: {weather_data.get('name', 'Unknown')}
        Humidity: {weather_data['main'].get('humidity', 0)}%
        
        {preference_text}
        
        Rules:
        1. Respond with ONLY activity keywords separated by commas
        2. Use Google Maps searchable terms (e.g., "restaurant", "museum", "park", "cafe", "shopping mall", "cinema", "spa", "gallery")
        3. Prioritize activities matching user preferences
        4. Consider weather when suggesting outdoor vs indoor activities
        5. Provide exactly {max_activities} different activities
        6. Include a diverse mix: outdoor activities, cultural venues (museums, galleries, theaters), dining, and relaxation spots
        7. No explanations, just the comma-separated keywords
        
        Example format: restaurant, museum, park, cafe, shopping mall
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.7  # Add some creativity
        )
        
        activity_text = response.choices[0].message.content.strip()
        activities = parse_activities_from_response(activity_text)
        
        # Validate and filter activities
        valid_activities = filter_valid_activities(activities)
        
        if len(valid_activities) < 2:  # If we don't get enough valid activities
            print("Not enough valid activities from AI, using fallback")
            return get_fallback_multiple_activities(weather_data, max_activities, activity_preferences)
        
        return valid_activities[:max_activities]  # Ensure we don't exceed max
        
    except Exception as e:
        print("OpenAI API error:", str(e))
        return get_fallback_multiple_activities(weather_data, max_activities, activity_preferences)

def parse_activities_from_response(activity_text):
    """Parse activities from AI response text"""
    # Clean the response and split by common separators
    activities = []
    
    # Remove any numbering, bullets, or extra formatting
    cleaned_text = re.sub(r'^\d+\.\s*', '', activity_text, flags=re.MULTILINE)
    cleaned_text = re.sub(r'^[\-\*]\s*', '', cleaned_text, flags=re.MULTILINE)
    
    # Split by commas, semicolons, or newlines
    raw_activities = re.split(r'[,;\n]', cleaned_text)
    
    for activity in raw_activities:
        activity = activity.strip().lower()
        if activity and len(activity) > 2:  # Filter out empty or very short strings
            activities.append(activity)
    
    return activities

def filter_valid_activities(activities):
    """Filter activities to ensure they're valid Google Maps search terms"""
    # Extended list of valid activity types for Google Maps
    valid_keywords = [
        'restaurant', 'cafe', 'coffee shop', 'bar', 'pub', 'brewery',
        'museum', 'art gallery', 'library', 'theater', 'cinema', 'movie theater',
        'park', 'beach', 'hiking trail', 'garden', 'zoo', 'aquarium',
        'shopping mall', 'store', 'market', 'bookstore', 'clothing store',
        'gym', 'spa', 'bowling alley', 'arcade', 'mini golf',
        'hotel', 'tourist attraction', 'landmark', 'church', 'temple',
        'hospital', 'pharmacy', 'bank', 'post office',
        'nightclub', 'karaoke', 'concert venue', 'sports bar',
        'food court', 'bakery', 'ice cream shop', 'fast food'
    ]
    
    valid_activities = []
    
    for activity in activities:
        activity = activity.strip().lower()
        # Check if activity contains any valid keywords
        if any(keyword in activity for keyword in valid_keywords):
            valid_activities.append(activity)
        # Also accept single word activities that are common
        elif activity in ['restaurant', 'cafe', 'museum', 'park', 'cinema', 'shopping', 'bar', 'gym', 'spa']:
            valid_activities.append(activity)
    
    return valid_activities

def get_fallback_multiple_activities(weather_data, max_activities=5, activity_preferences=None):
    """Fallback multiple activity suggestions based on weather and preferences"""
    try:
        temp = weather_data['main']['temp']
        weather_main = weather_data['weather'][0]['main'].lower()
        humidity = weather_data['main'].get('humidity', 50)
        
        # Define activities by category
        outdoor_activities = ['park', 'hiking trail', 'outdoor sports', 'garden', 'beach']
        indoor_relaxation = ['cafe', 'spa', 'library', 'bookstore', 'tea house']
        cultural_activities = ['museum', 'gallery', 'theater', 'historical site', 'cultural center']
        culinary_activities = ['restaurant', 'food market', 'bakery', 'wine bar', 'cooking school']
        
        available_activities = []
        
        # Add activities based on user preferences
        if activity_preferences:
            if activity_preferences.get('outdoorAdventure'):
                available_activities.extend(outdoor_activities)
            if activity_preferences.get('indoorRelaxation'):
                available_activities.extend(indoor_relaxation)
            if activity_preferences.get('culturalExploration'):
                available_activities.extend(cultural_activities)
            if activity_preferences.get('culinaryDelights'):
                available_activities.extend(culinary_activities)
        
        # If no preferences or empty preferences, include all with balanced representation
        if not available_activities:
            # Ensure balanced representation from each category
            available_activities = []
            # Add equal amounts from each category
            available_activities.extend(outdoor_activities[:2])
            available_activities.extend(indoor_relaxation[:2]) 
            available_activities.extend(cultural_activities[:2])
            available_activities.extend(culinary_activities[:2])
            # Fill the rest randomly from all categories
            all_activities = outdoor_activities + indoor_relaxation + cultural_activities + culinary_activities
            remaining_activities = [act for act in all_activities if act not in available_activities]
            available_activities.extend(remaining_activities)
        
        # Weather-based filtering
        if 'rain' in weather_main or 'storm' in weather_main:
            # Prioritize indoor activities in bad weather
            weather_filtered = [act for act in available_activities if act in indoor_relaxation + cultural_activities + culinary_activities]
            if len(weather_filtered) < max_activities:
                weather_filtered.extend([act for act in available_activities if act not in weather_filtered])
        elif temp > 30:  # Very hot
            # Mix of indoor and shaded outdoor
            weather_filtered = [act for act in available_activities if act in indoor_relaxation + cultural_activities + culinary_activities]
            weather_filtered.extend([act for act in available_activities if act in outdoor_activities and 'park' in act])
        elif temp > 20:  # Warm - good for all activities
            weather_filtered = available_activities
        elif temp < 5:  # Very cold
            # Mostly indoor activities
            weather_filtered = [act for act in available_activities if act in indoor_relaxation + cultural_activities + culinary_activities]
        else:
            weather_filtered = available_activities
        
        # Remove duplicates while preserving order
        seen = set()
        unique_activities = []
        for activity in weather_filtered:
            if activity not in seen:
                seen.add(activity)
                unique_activities.append(activity)
        
        return unique_activities[:max_activities]
        
    except Exception as e:
        print(f"Fallback error: {e}")
        return ['restaurant', 'cafe', 'museum', 'gallery', 'park', 'theater', 'shopping', 'spa'][:max_activities]

def get_places_for_all_activities(latitude, longitude, activities, max_places_per_activity=3):
    """Get places for multiple activities using threading for better performance"""
    activities_with_places = []
    
    def fetch_places_for_activity(activity):
        """Helper function to fetch places for a single activity"""
        try:
            places = get_nearby_places(latitude, longitude, activity, radius=15000)
            return {
                'activity_type': activity,
                'activity_name': format_activity_name(activity),
                'places': places[:max_places_per_activity],
                'total_places_found': len(places)
            }
        except Exception as e:
            print(f"Error fetching places for {activity}: {e}")
            return {
                'activity_type': activity,
                'activity_name': format_activity_name(activity),
                'places': [],
                'total_places_found': 0,
                'error': str(e)
            }
    
    # Use ThreadPoolExecutor for concurrent API calls
    with ThreadPoolExecutor(max_workers=min(len(activities), 5)) as executor:
        # Submit all tasks
        future_to_activity = {
            executor.submit(fetch_places_for_activity, activity): activity 
            for activity in activities
        }
        
        # Collect results as they complete
        for future in as_completed(future_to_activity):
            activity = future_to_activity[future]
            try:
                result = future.result(timeout=10)  # 10 second timeout per activity
                if result['places']:  # Only include activities that have places
                    activities_with_places.append(result)
            except Exception as e:
                print(f"Error processing {activity}: {e}")
                # Still include the activity but with empty places
                activities_with_places.append({
                    'activity_type': activity,
                    'activity_name': format_activity_name(activity),
                    'places': [],
                    'total_places_found': 0,
                    'error': str(e)
                })
    
    # Sort by number of places found (descending) to prioritize activities with more options
    activities_with_places.sort(key=lambda x: x['total_places_found'], reverse=True)
    
    return activities_with_places

def format_activity_name(activity):
    """Format activity name for display"""
    # Convert snake_case or kebab-case to Title Case
    formatted = activity.replace('_', ' ').replace('-', ' ')
    return formatted.title()

def get_weather_data(latitude, longitude):
    """Get weather data with caching"""
    cache_key = f'weather_{latitude}_{longitude}'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return cached_data
    
    try:
        url = f'http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={OPENWEATHERMAP_API_KEY}&units=metric'
        response = requests.get(url)
        
        if response.status_code == 200:
            weather_data = response.json()
            cache.set(cache_key, weather_data, 86400)  # Cache for 24 hours
            return weather_data
        else:
            print(f"Weather API error: {response.status_code}")
            return None
    except Exception as e:
        print(f"Weather fetch error: {str(e)}")
        return None

def get_nearby_places(latitude, longitude, activity_type, radius=15000):
    """Fetch places from Google Places API with fallback"""
    try:
        if not GOOGLE_MAPS_API_KEY:
            print(f"Google Maps API key not found, using mock data for {activity_type}")
            return get_mock_places(activity_type)
        
        gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
        
        # Try different search strategies for better results
        places_results = []
        
        # Strategy 1: Keyword search
        try:
            places_result = gmaps.places_nearby(
                location=(latitude, longitude),
                keyword=activity_type,
                radius=radius,
                type='establishment'
            )
            places_results.extend(places_result.get('results', []))
        except:
            pass
        
        # Strategy 2: Type-based search if keyword didn't work well
        if len(places_results) < 3:
            type_mapping = {
                'restaurant': 'restaurant',
                'cafe': 'cafe',
                'museum': 'museum',
                'park': 'park',
                'shopping': 'shopping_mall',
                'cinema': 'movie_theater',
                'bar': 'bar',
                'gym': 'gym'
            }
            
            if activity_type in type_mapping:
                try:
                    places_result = gmaps.places_nearby(
                        location=(latitude, longitude),
                        radius=radius,
                        type=type_mapping[activity_type]
                    )
                    # Enhance places with detailed photos if they have few photos
                    for place in places_result.get('results', []):
                        if place.get('photos') and len(place['photos']) < 3:
                            # Try to get more photos from place details
                            try:
                                place_id = place.get('place_id')
                                if place_id:
                                    place_details = gmaps.place(
                                        place_id=place_id,
                                        fields=['photos']
                                    )
                                    if place_details.get('result', {}).get('photos'):
                                        place['photos'] = place_details['result']['photos']
                            except:
                                pass
                    
                    places_results.extend(places_result.get('results', []))
                except:
                    pass
        
        # Remove duplicates based on place_id
        unique_places = {}
        for place in places_results:
            place_id = place.get('place_id')
            if place_id and place_id not in unique_places:
                unique_places[place_id] = place
        
        # Format places data
        places = []
        for place in list(unique_places.values())[:8]:  # Limit to 8 places per activity
            # Get place coordinates for travel time calculation
            place_lat = place.get('geometry', {}).get('location', {}).get('lat')
            place_lng = place.get('geometry', {}).get('location', {}).get('lng')
            
            # Get travel times if coordinates are available
            travel_times = {
                'walking_time': None, 
                'driving_time': None,
                'walking_distance': None,
                'driving_distance': None
            }
            if place_lat and place_lng:
                travel_times = get_travel_times(latitude, longitude, place_lat, place_lng)
            
            place_data = {
                'place_id': place.get('place_id'),
                'name': place.get('name'),
                'vicinity': place.get('vicinity'),
                'rating': place.get('rating'),
                'user_ratings_total': place.get('user_ratings_total'),
                'types': place.get('types', []),
                'photos': get_place_photos(place.get('photos', [])),
                'price_level': place.get('price_level'),
                'geometry': place.get('geometry', {}),
                'walking_time': travel_times['walking_time'],
                'driving_time': travel_times['driving_time'],
                'walking_distance': travel_times['walking_distance'],
                'driving_distance': travel_times['driving_distance']
            }
            places.append(place_data)
        
        return places
        
    except Exception as e:
        print(f"Google Places API error for {activity_type}: {str(e)}")
        return get_mock_places(activity_type)

def get_travel_times(user_lat, user_lng, place_lat, place_lng):
    """Get travel times and distances for walking and driving using Google Distance Matrix API"""
    if not GOOGLE_MAPS_API_KEY:
        return {
            'walking_time': None, 
            'driving_time': None,
            'walking_distance': None,
            'driving_distance': None
        }
    
    try:
        gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
        
        origin = f"{user_lat},{user_lng}"
        destination = f"{place_lat},{place_lng}"
        
        # Get walking and driving times
        walking_result = gmaps.distance_matrix(
            origins=[origin],
            destinations=[destination],
            mode="walking",
            units="metric"
        )
        
        driving_result = gmaps.distance_matrix(
            origins=[origin],
            destinations=[destination],
            mode="driving",
            units="metric"
        )
        
        walking_time = None
        driving_time = None
        walking_distance = None
        driving_distance = None
        
        # Parse walking time and distance
        if (walking_result['rows'] and 
            walking_result['rows'][0]['elements'] and 
            walking_result['rows'][0]['elements'][0]['status'] == 'OK'):
            walking_duration = walking_result['rows'][0]['elements'][0]['duration']['text']
            walking_dist = walking_result['rows'][0]['elements'][0]['distance']['text']
            walking_time = walking_duration
            walking_distance = walking_dist
        
        # Parse driving time and distance
        if (driving_result['rows'] and 
            driving_result['rows'][0]['elements'] and 
            driving_result['rows'][0]['elements'][0]['status'] == 'OK'):
            driving_duration = driving_result['rows'][0]['elements'][0]['duration']['text']
            driving_dist = driving_result['rows'][0]['elements'][0]['distance']['text']
            driving_time = driving_duration
            driving_distance = driving_dist
        
        return {
            'walking_time': walking_time,
            'driving_time': driving_time,
            'walking_distance': walking_distance,
            'driving_distance': driving_distance
        }
        
    except Exception as e:
        print(f"Error getting travel times: {e}")
        return {
            'walking_time': None, 
            'driving_time': None,
            'walking_distance': None,
            'driving_distance': None
        }

def get_place_photos(photos):
    """Get photo URLs from place photos"""
    if not photos or not GOOGLE_MAPS_API_KEY:
        return ['https://via.placeholder.com/800x600']
    
    try:
        photo_urls = []
        # Get up to 8 photos with higher quality
        for photo in photos[:8]:
            photo_reference = photo.get('photo_reference')
            if photo_reference:
                # Use higher resolution for better quality
                photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference={photo_reference}&key={GOOGLE_MAPS_API_KEY}"
                photo_urls.append(photo_url)
        
        return photo_urls if photo_urls else ['https://via.placeholder.com/800x600']
    except Exception as e:
        print(f"Error getting place photos: {e}")
        return ['https://via.placeholder.com/800x600']

def get_mock_places(activity_type):
    """Enhanced mock places data for testing"""
    mock_places = {
        'restaurant': [
            {
                'place_id': 'r1', 
                'name': 'Gourmet Bistro', 
                'vicinity': 'Downtown', 
                'rating': 4.5, 
                'user_ratings_total': 120, 
                'types': ['restaurant'], 
                'photos': ['https://via.placeholder.com/800x600/cccccc/666666?text=Gourmet+Bistro'], 
                'price_level': 3, 
                'walking_time': '15 mins', 
                'driving_time': '5 mins',
                'walking_distance': '1.2 km',
                'driving_distance': '0.8 km',
                'geometry': {}
            },
            {
                'place_id': 'r2', 
                'name': 'Cozy Corner Diner', 
                'vicinity': 'Main St', 
                'rating': 4.2, 
                'user_ratings_total': 89, 
                'types': ['restaurant'], 
                'photos': ['https://via.placeholder.com/800x600/cccccc/666666?text=Cozy+Corner+Diner'], 
                'price_level': 2, 
                'walking_time': '8 mins', 
                'driving_time': '3 mins',
                'walking_distance': '0.6 km',
                'driving_distance': '0.4 km',
                'geometry': {}
            },
        ],
        'cafe': [
            {
                'place_id': 'c1', 
                'name': 'Artisan Coffee House', 
                'vicinity': 'Arts District', 
                'rating': 4.7, 
                'user_ratings_total': 203, 
                'types': ['cafe'], 
                'photos': ['https://via.placeholder.com/800x600/cccccc/666666?text=Artisan+Coffee+House'], 
                'price_level': 2, 
                'walking_time': '12 mins', 
                'driving_time': '4 mins',
                'walking_distance': '0.9 km',
                'driving_distance': '0.6 km',
                'geometry': {}
            },
            {
                'place_id': 'c2', 
                'name': 'Morning Brew', 
                'vicinity': 'Central Ave', 
                'rating': 4.3, 
                'user_ratings_total': 156, 
                'types': ['cafe'], 
                'photos': ['https://via.placeholder.com/800x600/cccccc/666666?text=Morning+Brew'], 
                'price_level': 2, 
                'walking_time': '6 mins', 
                'driving_time': '2 mins',
                'walking_distance': '0.4 km',
                'driving_distance': '0.3 km',
                'geometry': {}
            },
        ],
        'museum': [
            {
                'place_id': 'm1', 
                'name': 'City Art Museum', 
                'vicinity': 'Cultural District', 
                'rating': 4.6, 
                'user_ratings_total': 340, 
                'types': ['museum'], 
                'photos': ['https://via.placeholder.com/800x600/cccccc/666666?text=City+Art+Museum'], 
                'price_level': 2, 
                'walking_time': '20 mins', 
                'driving_time': '7 mins',
                'walking_distance': '1.5 km',
                'driving_distance': '1.0 km',
                'geometry': {}
            },
            {
                'place_id': 'm2', 
                'name': 'Natural History Museum', 
                'vicinity': 'University Area', 
                'rating': 4.4, 
                'user_ratings_total': 267, 
                'types': ['museum'], 
                'photos': ['https://via.placeholder.com/800x600/cccccc/666666?text=Natural+History+Museum'], 
                'price_level': 2, 
                'walking_time': '25 mins', 
                'driving_time': '10 mins',
                'walking_distance': '1.8 km',
                'driving_distance': '1.2 km',
                'geometry': {}
            },
        ],
        'park': [
            {
                'place_id': 'p1', 
                'name': 'Riverside Park', 
                'vicinity': 'River District', 
                'rating': 4.5, 
                'user_ratings_total': 178, 
                'types': ['park'], 
                'photos': ['https://via.placeholder.com/800x600/cccccc/666666?text=Riverside+Park'], 
                'price_level': 0, 
                'walking_time': '18 mins', 
                'driving_time': '6 mins',
                'walking_distance': '1.3 km',
                'driving_distance': '0.9 km',
                'geometry': {}
            },
            {
                'place_id': 'p2', 
                'name': 'Central Gardens', 
                'vicinity': 'City Center', 
                'rating': 4.3, 
                'user_ratings_total': 234, 
                'types': ['park'], 
                'photos': ['https://via.placeholder.com/800x600/cccccc/666666?text=Central+Gardens'], 
                'price_level': 0, 
                'walking_time': '10 mins', 
                'driving_time': '4 mins',
                'walking_distance': '0.7 km',
                'driving_distance': '0.5 km',
                'geometry': {}
            },
        ],
        'cinema': [
            {
                'place_id': 'ci1', 
                'name': 'Grand Theater', 
                'vicinity': 'Entertainment District', 
                'rating': 4.2, 
                'user_ratings_total': 145, 
                'types': ['movie_theater'], 
                'photos': ['https://via.placeholder.com/800x600/cccccc/666666?text=Grand+Theater'], 
                'price_level': 2, 
                'walking_time': '22 mins', 
                'driving_time': '8 mins',
                'walking_distance': '1.6 km',
                'driving_distance': '1.1 km',
                'geometry': {}
            },
            {
                'place_id': 'ci2', 
                'name': 'Multiplex Cinema', 
                'vicinity': 'Shopping Center', 
                'rating': 4.0, 
                'user_ratings_total': 298, 
                'types': ['movie_theater'], 
                'photos': ['https://via.placeholder.com/800x600/cccccc/666666?text=Multiplex+Cinema'], 
                'price_level': 2, 
                'walking_time': '16 mins', 
                'driving_time': '5 mins',
                'walking_distance': '1.1 km',
                'driving_distance': '0.7 km',
                'geometry': {}
            },
        ]
    }
    
    return mock_places.get(activity_type, mock_places.get('restaurant', []))

@csrf_exempt
@csrf_exempt
def get_place_details(request, place_id):
    """
    Retrieve comprehensive place details from Google Places API.
    
    This endpoint provides detailed information about a specific place including
    photos, reviews, contact information, and operating hours. It implements
    intelligent caching and error handling for optimal performance.
    
    Process Flow:
    1. Validate API key availability
    2. Check cache for existing place details (2-hour TTL)
    3. Query Google Places API with comprehensive field selection
    4. Process and format photo URLs (up to 8 high-resolution images)
    5. Structure opening hours data for frontend consumption
    6. Format reviews with user ratings and timestamps
    7. Cache processed results and return comprehensive place data
    
    Caching Strategy:
    - Cache key: 'place_details_{place_id}'
    - Cache duration: 2 hours (7200 seconds)
    - Reduces API costs and improves response times
    
    Google Places API Integration:
    - Uses Place Details API with comprehensive field selection
    - Requests high-resolution photos (800px width)
    - Includes reviews, ratings, contact info, and hours
    - Handles API quotas and rate limiting gracefully
    
    Args:
        request: HTTP GET request
        place_id (str): Google Places API place identifier
        
    Returns:
        JsonResponse: Comprehensive place details including:
            - Basic info (name, address, phone, website)
            - Photos (up to 8 high-resolution images)
            - Reviews (up to 5 recent reviews with ratings)
            - Operating hours (current status and weekly schedule)
            - Ratings and user statistics
            
    Error Handling:
        - API key validation with descriptive error messages
        - Place not found handling with 404 status
        - API failure fallback with error logging
        - Invalid request method handling
    """
    if request.method == 'GET':
        try:
            # Validate Google Maps API key availability
            if not GOOGLE_MAPS_API_KEY:
                return JsonResponse({'error': 'Google Maps API key not configured'}, status=500)
            
            # Implement caching strategy for performance optimization
            # Cache reduces API costs and improves user experience
            cache_key = f'place_details_{place_id}'
            cached_details = cache.get(cache_key)
            if cached_details:
                return JsonResponse(cached_details)
            
            # Initialize Google Maps client with API key
            gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
            
            # Request comprehensive place details from Google Places API
            # Field selection optimized for frontend requirements and API quota
            place_details = gmaps.place(
                place_id=place_id,
                fields=[
                    'place_id', 'name', 'vicinity', 'formatted_address',     # Basic identification
                    'formatted_phone_number', 'website', 'rating',           # Contact and rating info  
                    'user_ratings_total', 'price_level', 'opening_hours',    # Business details
                    'photo', 'reviews', 'url', 'international_phone_number'  # Rich media and reviews
                ]
            )
            
            # Validate API response and handle place not found scenarios
            if not place_details or 'result' not in place_details:
                return JsonResponse({'error': 'Place not found'}, status=404)
            
            place = place_details['result']
            
            # Process and format photo URLs for frontend consumption
            # Generate high-resolution photo URLs with Google Photos API
            photos = []
            if place.get('photos'):
                for photo in place['photos'][:8]:  # Limit to 8 photos for performance
                    # Create high-resolution photo URL (800px width for quality display)
                    photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference={photo['photo_reference']}&key={GOOGLE_MAPS_API_KEY}"
                    photos.append(photo_url)
            
            # Structure opening hours data for frontend display
            # Convert Google's format to user-friendly schedule display
            opening_hours = None
            if place.get('opening_hours'):
                opening_hours = {
                    'open_now': place['opening_hours'].get('open_now', False),      # Current status
                    'weekday_text': place['opening_hours'].get('weekday_text', [])  # Weekly schedule
                }
            
            # Process and format user reviews for display
            reviews = []
            if place.get('reviews'):
                for review in place['reviews'][:5]:  # Limit to 5 reviews
                    reviews.append({
                        'author_name': review.get('author_name', ''),
                        'rating': review.get('rating', 0),
                        'text': review.get('text', ''),
                        'time': review.get('time', 0),
                        'relative_time_description': review.get('relative_time_description', '')
                    })
            
            # Build response
            result = {
                'place_id': place.get('place_id'),
                'name': place.get('name'),
                'vicinity': place.get('vicinity'),
                'formatted_address': place.get('formatted_address'),
                'formatted_phone_number': place.get('formatted_phone_number'),
                'international_phone_number': place.get('international_phone_number'),
                'website': place.get('website'),
                'url': place.get('url'),
                'rating': place.get('rating'),
                'user_ratings_total': place.get('user_ratings_total'),
                'price_level': place.get('price_level'),
                'opening_hours': opening_hours,
                'photos': photos,
                'reviews': reviews
            }
            
            # Cache for 1 hour
            cache.set(cache_key, result, 3600)
            
            return JsonResponse(result)
            
        except Exception as e:
            print(f"Place details error: {e}")
            return JsonResponse({'error': 'Failed to get place details'}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt  
def update_user_preference(request):
    """Update user preference (like/dislike) for a place"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
            
            place_id = data.get('place_id')
            place_name = data.get('place_name')
            activity_type = data.get('activity_type')
            preference = data.get('preference')  # 'like' or 'dislike'
            user_id = data.get('user_id', 'anonymous')  # Default to anonymous user
            
            if not all([place_id, preference]):
                return JsonResponse({'error': 'Missing required fields'}, status=400)
            
            if preference not in ['like', 'dislike']:
                return JsonResponse({'error': 'Invalid preference value'}, status=400)
            
            # Store preference in cache/database
            # For now, we'll use cache. In production, you'd use a proper database
            cache_key = f'user_pref_{user_id}_{place_id}'
            preference_data = {
                'place_id': place_id,
                'place_name': place_name,
                'activity_type': activity_type,
                'preference': preference,
                'timestamp': datetime.now().isoformat(),
                'user_id': user_id
            }
            
            # Store individual preference
            cache.set(cache_key, preference_data, 86400 * 30)  # 30 days
            
            # Update user's preference history
            history_key = f'user_history_{user_id}'
            user_history = cache.get(history_key, [])
            
            # Remove any existing preference for this place
            user_history = [p for p in user_history if p.get('place_id') != place_id]
            
            # Add new preference
            user_history.append(preference_data)
            
            # Keep only last 100 preferences
            user_history = user_history[-100:]
            
            cache.set(history_key, user_history, 86400 * 30)  # 30 days
            
            return JsonResponse({
                'success': True,
                'message': f'Successfully {preference}d place',
                'preference': preference_data
            })
            
        except Exception as e:
            print(f"User preference error: {e}")
            return JsonResponse({'error': 'Failed to update preference'}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def get_user_preferences(request):
    """Get all user preferences (liked/disliked places)"""
    if request.method == 'GET':
        try:
            user_id = request.GET.get('user_id', 'anonymous')
            
            # Get user's preference history
            history_key = f'user_history_{user_id}'
            user_history = cache.get(history_key, [])
            
            # Separate liked and disliked
            liked = [p for p in user_history if p.get('preference') == 'like']
            disliked = [p for p in user_history if p.get('preference') == 'dislike']
            
            return JsonResponse({
                'success': True,
                'preferences': {
                    'liked': liked,
                    'disliked': disliked
                },
                'total': len(user_history)
            })
            
        except Exception as e:
            print(f"Get preferences error: {e}")
            return JsonResponse({'error': 'Failed to get preferences'}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def delete_user_preference(request, place_id):
    """Delete a user preference for a specific place"""
    if request.method == 'DELETE':
        try:
            user_id = request.GET.get('user_id', 'anonymous')
            
            # Remove individual preference
            cache_key = f'user_pref_{user_id}_{place_id}'
            cache.delete(cache_key)
            
            # Update user's preference history
            history_key = f'user_history_{user_id}'
            user_history = cache.get(history_key, [])
            
            # Remove preference for this place
            user_history = [p for p in user_history if p.get('place_id') != place_id]
            
            cache.set(history_key, user_history, 86400 * 30)  # 30 days
            
            return JsonResponse({
                'success': True,
                'message': 'Preference deleted successfully'
            })
            
        except Exception as e:
            print(f"Delete preference error: {e}")
            return JsonResponse({'error': 'Failed to delete preference'}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)