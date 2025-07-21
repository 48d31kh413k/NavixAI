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
from django.http import JsonResponse
import googlemaps
from django.conf import settings
from datetime import datetime, timedelta
import logging

# Load environment variables
load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')
OPENWEATHERMAP_API_KEY = os.getenv('OPENWEATHERMAP_API_KEY')
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

# Set up logging
logger = logging.getLogger(__name__)

@api_view(['GET'])
def test(request):
    return Response({'message': 'API is working'})

@csrf_exempt
def get_weather_suggestions(request):
    if request.method == 'POST':
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')

        # Check cache for weather data
        cache_key = f'weather_{latitude}_{longitude}'
        weather_data = cache.get(cache_key)

        if not weather_data:
            # Fetch weather data from OpenWeatherMap API
            url = f'http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={OPENWEATHERMAP_API_KEY}&units=metric'
            try:
                response = requests.get(url)
                if response.status_code == 200:
                    weather_data = response.json()
                    # Cache the result for 15 minutes (900 seconds)
                    cache.set(cache_key, weather_data, 900)
                else:
                    return JsonResponse({'error': 'Failed to fetch weather data'}, status=500)
            except Exception as e:
                return JsonResponse({'error': f'Weather API error: {str(e)}'}, status=500)

        return JsonResponse(weather_data)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def get_activity_suggestion(request):
    if request.method == 'POST':
        # Parse input
        data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        # Validate input
        if not latitude or not longitude:
            return JsonResponse({'error': 'Missing coordinates'}, status=400)

        # 1. Check cache first
        cache_key = f'activity_{latitude}_{longitude}'
        cached_result = cache.get(cache_key)
        if cached_result:
            return JsonResponse(cached_result)

        # 2. Get weather data
        weather_data = get_weather_data(latitude, longitude)
        if not weather_data or 'error' in weather_data:
            return JsonResponse({'error': 'Failed to fetch weather data'}, status=500)

        # 3. Call OpenAI API
        try:
            current_time = get_time_of_day()
            location_name = weather_data.get('name', 'this location')
            weather_desc = weather_data['weather'][0]['description']
            
            prompt = f"""
            Suggest a type of activity for someone in {location_name} where the weather is {weather_desc} and the time is {current_time}.
            Consider the weather conditions and time of day.
            Respond only with the activity type (e.g., 'museum', 'park', 'cafe', 'cinema', 'shopping mall', 'restaurant').
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=20,
                temperature=0.7
            )
            
            activity = response.choices[0].message.content.strip().lower()
            
            # 4. Validate activity
            activity = validate_activity(activity)
            
            # 5. Get nearby places for the suggested activity
            nearby_places = get_nearby_places(latitude, longitude, activity)
            
            result = {
                'activity': activity,
                'places': nearby_places,
                'weather': weather_data,
                'location': {'lat': float(latitude), 'lng': float(longitude)}
            }
            
            # Cache for 1 hour (3600 seconds)
            cache.set(cache_key, result, 3600)
            
            return JsonResponse(result)
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            # Fallback to default activity
            fallback_activity = get_fallback_activity(weather_data)
            nearby_places = get_nearby_places(latitude, longitude, fallback_activity)
            
            result = {
                'activity': fallback_activity,
                'places': nearby_places,
                'weather': weather_data,
                'location': {'lat': float(latitude), 'lng': float(longitude)}
            }
            
            return JsonResponse(result)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

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
            cache.set(cache_key, weather_data, 900)  # Cache for 15 minutes
            return weather_data
        else:
            return {'error': 'Failed to fetch weather data'}
    except Exception as e:
        logger.error(f"Weather API error: {str(e)}")
        return {'error': str(e)}

def get_time_of_day():
    """Get current time of day"""
    current_hour = datetime.now().hour
    if 5 <= current_hour < 12:
        return "morning"
    elif 12 <= current_hour < 17:
        return "afternoon"
    elif 17 <= current_hour < 21:
        return "evening"
    else:
        return "night"

def validate_activity(activity):
    """Validate and clean activity type"""
    valid_activities = {
        'park': ['park', 'garden', 'outdoor', 'nature'],
        'museum': ['museum', 'gallery', 'art', 'history'],
        'cafe': ['cafe', 'coffee', 'tea'],
        'restaurant': ['restaurant', 'dining', 'food'],
        'cinema': ['cinema', 'movie', 'theater', 'film'],
        'shopping': ['shopping', 'mall', 'store', 'market'],
        'gym': ['gym', 'fitness', 'workout'],
        'library': ['library', 'book', 'reading'],
        'bar': ['bar', 'pub', 'drinks'],
        'spa': ['spa', 'massage', 'wellness']
    }
    
    # Check if activity matches any valid category
    for category, keywords in valid_activities.items():
        if any(keyword in activity for keyword in keywords):
            return category
    
    # Default fallback
    return 'park'

def get_fallback_activity(weather_data):
    """Get fallback activity based on weather"""
    if weather_data and 'weather' in weather_data:
        weather_desc = weather_data['weather'][0]['main'].lower()
        if 'rain' in weather_desc or 'storm' in weather_desc:
            return 'museum'
        elif 'clear' in weather_desc or 'sun' in weather_desc:
            return 'park'
    return 'cafe'

def get_nearby_places(latitude, longitude, activity_type, radius=5000):
    """Fetch places from Google Places API"""
    if not GOOGLE_MAPS_API_KEY:
        logger.error("Google Maps API key not configured")
        return []
    
    try:
        gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
        
        # Map activity types to Google Places types
        place_types = {
            'park': 'park',
            'museum': 'museum',
            'cafe': 'cafe',
            'restaurant': 'restaurant',
            'cinema': 'movie_theater',
            'shopping': 'shopping_mall',
            'gym': 'gym',
            'library': 'library',
            'bar': 'bar',
            'spa': 'spa'
        }
        
        place_type = place_types.get(activity_type, 'establishment')
        
        places_result = gmaps.places_nearby(
            location=(latitude, longitude),
            keyword=activity_type,
            radius=radius,
            type=place_type
        )
        
        places = []
        for place in places_result.get('results', [])[:5]:  # Return top 5 results
            place_data = {
                'place_id': place.get('place_id'),
                'name': place.get('name'),
                'address': place.get('vicinity'),
                'rating': place.get('rating'),
                'location': place.get('geometry', {}).get('location'),
                'types': place.get('types', []),
                'price_level': place.get('price_level'),
                'opening_hours': place.get('opening_hours', {}).get('open_now'),
                'photos': []
            }
            
            # Get photo references
            if place.get('photos'):
                for photo in place['photos'][:2]:  # Get first 2 photos
                    photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo['photo_reference']}&key={GOOGLE_MAPS_API_KEY}"
                    place_data['photos'].append(photo_url)
            
            places.append(place_data)
        
        return places
        
    except Exception as e:
        logger.error(f"Google Places API error: {str(e)}")
        return []

@csrf_exempt
def record_user_interaction(request):
    """Record user swipe/interaction"""
    if request.method == 'POST':
        data = json.loads(request.body)
        place_id = data.get('place_id')
        action = data.get('action')  # 'like' or 'dislike'
        
        # For now, just store in session since we're not using authentication
        if 'disliked_places' not in request.session:
            request.session['disliked_places'] = []
        
        if action == 'dislike':
            request.session['disliked_places'].append(place_id)
            request.session.modified = True
        
        return JsonResponse({'status': 'success'})
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)