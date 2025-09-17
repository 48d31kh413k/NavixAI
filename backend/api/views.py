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
from django.urls import path
from . import views

load_dotenv()

# Get API keys from environment variables
openai.api_key = os.getenv('OPENAI_API_KEY')
OPENWEATHERMAP_API_KEY = os.getenv('OPENWEATHERMAP_API_KEY')
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

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
        #debugging
        # print("Weather data from cache:", weather_data)

        if not weather_data:
            # Fetch weather data from OpenWeatherMap API
            url = f'http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={OPENWEATHERMAP_API_KEY}&units=metric'
            response = requests.get(url)
            if response.status_code == 200:
                weather_data = response.json()
                # Cache the result for 1 week (604800 seconds)
                cache.set(cache_key, weather_data, 604800)
            else:
                return JsonResponse({'error': 'Failed to fetch weather data'}, status=500)

        return JsonResponse(weather_data)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def get_activity_suggestion(request):
    if request.method == 'POST':
        try:
            # Parse input
            data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
            latitude = data.get('latitude')
            longitude = data.get('longitude')
            
            # Validate input
            if not latitude or not longitude:
                return JsonResponse({'error': 'Missing coordinates'}, status=400)

            # Create a cleaner cache key by rounding coordinates
            lat_rounded = round(float(latitude), 4)  # Round to 4 decimal places
            lng_rounded = round(float(longitude), 4)
            cache_key = f'activity_{lat_rounded}_{lng_rounded}'
            #debugging
            # print(f"Looking for cache key: {cache_key}")
            
            cached_result = cache.get(cache_key)
            # Debugging output
            # print(f"Cached activity: {cached_result}")
            
            if cached_result:
                # Debugging output
                # print("Returning cached result")
                return JsonResponse(cached_result)
                
            # Debugging output
            # print("No cache found, fetching new data...")

            # Get weather data
            weather_data = get_weather_data(latitude, longitude)
            if not weather_data or 'error' in weather_data:
                return JsonResponse({'error': 'Failed to get weather data'}, status=500)

            # Get activity suggestion
            activity = get_activity_from_ai(weather_data) or 'park'
            
            # Get nearby places
            nearby_places = get_nearby_places(latitude, longitude, activity)
            
            result = {
                'activity': activity,
                'places': nearby_places,
                'weather': weather_data
            }
            # Debugging output
            # print(f"Attempting to cache result with key: {cache_key}")
            
            # Cache for 1 hour (3600 seconds) instead of 1 week for testing
            cache.set(cache_key, result, 3600)
            
            #Debugging: Verify cache was saved
            # verification = cache.get(cache_key)
            # print(f"Cache verification successful: {verification is not None}")
            
            return JsonResponse(result)
            
        except Exception as e:
            print("Activity suggestion error:", str(e))
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': 'Failed to get activity suggestion'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

def get_activity_from_ai(weather_data):
    """Get activity suggestion from OpenAI with fallback"""
    try:
        if not openai.api_key:
            print("OpenAI API key not found, using fallback")
            return get_fallback_activity(weather_data)
        
        prompt = f"""
        Suggest an activity for someone where the weather is {weather_data['weather'][0]['description']}.
        Temperature: {weather_data['main']['temp']}°C
        Respond only with the activity type (e.g., 'museum', 'park', 'cafe', 'shopping', 'restaurant').
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=20,
        )
        activity = response.choices[0].message.content.strip().lower()
        
        # Validate activity
        valid_activities = ['park', 'museum', 'cafe', 'cinema', 'beach', 'restaurant', 'shopping']
        if not any(valid in activity for valid in valid_activities):
            return get_fallback_activity(weather_data)
        
        return activity
        
    except Exception as e:
        #debugging
        print("OpenAI API error:", str(e))
        return get_fallback_activity(weather_data)

def get_fallback_activity(weather_data):
    """Fallback activity suggestion based on weather"""
    try:
        temp = weather_data['main']['temp']
        weather_main = weather_data['weather'][0]['main'].lower()
        
        if 'rain' in weather_main or 'storm' in weather_main:
            return 'museum'
        elif temp > 25:
            return 'park'
        elif temp < 10:
            return 'cafe'
        else:
            return 'restaurant'
    except:
        return 'park'

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
            #debugging
            print(f"Weather API error: {response.status_code}")
            return None
    except Exception as e:
        #debugging
        print(f"Weather fetch error: {str(e)}")
        return None

def get_nearby_places(latitude, longitude, activity_type, radius=5000):
    """Fetch places from Google Places API with fallback"""
    try:
        # Use the API key from environment variable directly
        if not GOOGLE_MAPS_API_KEY:
            print("Google Maps API key not found, using mock data")
            return get_mock_places(activity_type)
        
        gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)
        
        places_result = gmaps.places_nearby(
            location=(latitude, longitude),
            keyword=activity_type,
            radius=radius,
            type='establishment'
        )
        
        places = []
        for place in places_result.get('results', [])[:5]:
            places.append({
                'place_id': place.get('place_id'),
                'name': place.get('name'),
                'vicinity': place.get('vicinity'),
                'rating': place.get('rating'),
                'user_ratings_total': place.get('user_ratings_total'),
                'types': place.get('types', []),
                'photos': get_place_photos(place.get('photos', []))
            })
        
        return places
        
    except Exception as e:
        #debugging
        print(f"Google Places API error: {str(e)}")
        return get_mock_places(activity_type)

def get_place_photos(photos):
    """Get photo URLs from place photos"""
    if not photos or not GOOGLE_MAPS_API_KEY:
        return ['https://via.placeholder.com/400x300']
    
    try:
        photo_reference = photos[0].get('photo_reference')
        if photo_reference:
            photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={GOOGLE_MAPS_API_KEY}"
            return [photo_url]
    except:
        pass
    
    return ['https://via.placeholder.com/400x300']

def get_mock_places(activity_type):
    """Mock places data for testing"""
    mock_places = {
        'park': [
            {'place_id': '1', 'name': 'Central Park', 'vicinity': 'Main Street', 'rating': 4.5, 'user_ratings_total': 100, 'types': ['park'], 'photos': ['https://via.placeholder.com/400x300']},
            {'place_id': '2', 'name': 'City Gardens', 'vicinity': 'Garden Ave', 'rating': 4.2, 'user_ratings_total': 75, 'types': ['park'], 'photos': ['https://via.placeholder.com/400x300']}
        ],
        'museum': [
            {'place_id': '3', 'name': 'Art Museum', 'vicinity': 'Culture St', 'rating': 4.7, 'user_ratings_total': 200, 'types': ['museum'], 'photos': ['https://via.placeholder.com/400x300']},
            {'place_id': '4', 'name': 'History Museum', 'vicinity': 'Heritage Rd', 'rating': 4.3, 'user_ratings_total': 150, 'types': ['museum'], 'photos': ['https://via.placeholder.com/400x300']}
        ],
        'cafe': [
            {'place_id': '5', 'name': 'Coffee Corner', 'vicinity': 'Bean Street', 'rating': 4.4, 'user_ratings_total': 80, 'types': ['cafe'], 'photos': ['https://via.placeholder.com/400x300']},
            {'place_id': '6', 'name': 'The Daily Grind', 'vicinity': 'Brew Ave', 'rating': 4.6, 'user_ratings_total': 120, 'types': ['cafe'], 'photos': ['https://via.placeholder.com/400x300']}
        ]
    }
    
    return mock_places.get(activity_type, mock_places['park'])