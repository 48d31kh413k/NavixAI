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
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

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
            max_activities = int(data.get('max_activities', 5))  # Allow client to specify max activities
            
            # Validate input
            if not latitude or not longitude:
                return JsonResponse({'error': 'Missing coordinates'}, status=400)

            # Create a cleaner cache key by rounding coordinates
            lat_rounded = round(float(latitude), 4)
            lng_rounded = round(float(longitude), 4)
            cache_key = f'multi_activity_{lat_rounded}_{lng_rounded}_{max_activities}'
            
            cached_result = cache.get(cache_key)
            if cached_result:
                print("Returning cached multi-activity result")
                return JsonResponse(cached_result)

            # Get weather data
            weather_data = get_weather_data(latitude, longitude)
            if not weather_data or 'error' in weather_data:
                return JsonResponse({'error': 'Failed to get weather data'}, status=500)

            # Get multiple activity suggestions from AI
            activities = get_multiple_activities_from_ai(weather_data, max_activities)
            print(f"Suggested activities: {activities}")
            
            # Get nearby places for all activities (with threading for performance)
            activities_with_places = get_places_for_all_activities(
                latitude, longitude, activities, max_activities
            )
            
            result = {
                'activities': activities_with_places,
                'weather': weather_data,
                'location': {
                    'latitude': latitude,
                    'longitude': longitude,
                    'city': weather_data.get('name', 'Unknown')
                }
            }
            
            # Cache for 1 hour
            cache.set(cache_key, result, 3600)
            print(f"Multi-activity result: Found {len(activities_with_places)} activities")
            
            return JsonResponse(result)
            
        except Exception as e:
            print("Multi-activity suggestion error:", str(e))
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': 'Failed to get activity suggestions'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

def get_multiple_activities_from_ai(weather_data, max_activities=5):
    """Get multiple activity suggestions from OpenAI with fallback"""
    try:
        if not openai.api_key:
            print("OpenAI API key not found, using fallback")
            return get_fallback_multiple_activities(weather_data, max_activities)
        
        prompt = f"""
        Given the weather conditions, suggest {max_activities} different activities for someone to do.
        
        Weather: {weather_data['weather'][0]['description']}
        Temperature: {weather_data['main']['temp']}°C
        Location: {weather_data.get('name', 'Unknown')}
        Humidity: {weather_data['main'].get('humidity', 0)}%
        
        Rules:
        1. Respond with ONLY activity keywords separated by commas
        2. Use Google Maps searchable terms (e.g., "restaurant", "museum", "park", "cafe", "shopping mall", "cinema")
        3. Consider both indoor and outdoor options based on weather
        4. Provide exactly {max_activities} different activities
        5. No explanations, just the comma-separated keywords
        
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
            return get_fallback_multiple_activities(weather_data, max_activities)
        
        return valid_activities[:max_activities]  # Ensure we don't exceed max
        
    except Exception as e:
        print("OpenAI API error:", str(e))
        return get_fallback_multiple_activities(weather_data, max_activities)

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

def get_fallback_multiple_activities(weather_data, max_activities=5):
    """Fallback multiple activity suggestions based on weather"""
    try:
        temp = weather_data['main']['temp']
        weather_main = weather_data['weather'][0]['main'].lower()
        humidity = weather_data['main'].get('humidity', 50)
        
        activities = []
        
        # Weather-based activity selection
        if 'rain' in weather_main or 'storm' in weather_main:
            activities = ['museum', 'cafe', 'shopping mall', 'cinema', 'library']
        elif temp > 30:  # Very hot
            activities = ['museum', 'shopping mall', 'cafe', 'cinema', 'ice cream shop']
        elif temp > 20:  # Warm
            activities = ['park', 'restaurant', 'cafe', 'museum', 'shopping']
        elif temp > 10:  # Cool
            activities = ['restaurant', 'cafe', 'museum', 'shopping mall', 'bar']
        else:  # Cold
            activities = ['cafe', 'restaurant', 'museum', 'cinema', 'shopping mall']
        
        return activities[:max_activities]
        
    except Exception as e:
        print(f"Fallback error: {e}")
        return ['restaurant', 'cafe', 'museum', 'park', 'shopping'][:max_activities]

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
            place_data = {
                'place_id': place.get('place_id'),
                'name': place.get('name'),
                'vicinity': place.get('vicinity'),
                'rating': place.get('rating'),
                'user_ratings_total': place.get('user_ratings_total'),
                'types': place.get('types', []),
                'photos': get_place_photos(place.get('photos', [])),
                'price_level': place.get('price_level'),
                'geometry': place.get('geometry', {})
            }
            places.append(place_data)
        
        return places
        
    except Exception as e:
        print(f"Google Places API error for {activity_type}: {str(e)}")
        return get_mock_places(activity_type)

def get_place_photos(photos):
    """Get photo URLs from place photos"""
    if not photos or not GOOGLE_MAPS_API_KEY:
        return ['https://via.placeholder.com/400x300']
    
    try:
        photo_urls = []
        # Get up to 3 photos
        for photo in photos[:3]:
            photo_reference = photo.get('photo_reference')
            if photo_reference:
                photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={GOOGLE_MAPS_API_KEY}"
                photo_urls.append(photo_url)
        
        return photo_urls if photo_urls else ['https://via.placeholder.com/400x300']
    except:
        return ['https://via.placeholder.com/400x300']

def get_mock_places(activity_type):
    """Enhanced mock places data for testing"""
    mock_places = {
        'restaurant': [
            {'place_id': 'r1', 'name': 'Gourmet Bistro', 'vicinity': 'Downtown', 'rating': 4.5, 'user_ratings_total': 120, 'types': ['restaurant'], 'photos': ['https://via.placeholder.com/400x300'], 'price_level': 3},
            {'place_id': 'r2', 'name': 'Cozy Corner Diner', 'vicinity': 'Main St', 'rating': 4.2, 'user_ratings_total': 89, 'types': ['restaurant'], 'photos': ['https://via.placeholder.com/400x300'], 'price_level': 2},
        ],
        'cafe': [
            {'place_id': 'c1', 'name': 'Artisan Coffee House', 'vicinity': 'Arts District', 'rating': 4.7, 'user_ratings_total': 203, 'types': ['cafe'], 'photos': ['https://via.placeholder.com/400x300'], 'price_level': 2},
            {'place_id': 'c2', 'name': 'Morning Brew', 'vicinity': 'Central Ave', 'rating': 4.3, 'user_ratings_total': 156, 'types': ['cafe'], 'photos': ['https://via.placeholder.com/400x300'], 'price_level': 2},
        ],
        'museum': [
            {'place_id': 'm1', 'name': 'City Art Museum', 'vicinity': 'Cultural District', 'rating': 4.6, 'user_ratings_total': 340, 'types': ['museum'], 'photos': ['https://via.placeholder.com/400x300'], 'price_level': 2},
            {'place_id': 'm2', 'name': 'Natural History Museum', 'vicinity': 'University Area', 'rating': 4.4, 'user_ratings_total': 267, 'types': ['museum'], 'photos': ['https://via.placeholder.com/400x300'], 'price_level': 2},
        ],
        'park': [
            {'place_id': 'p1', 'name': 'Riverside Park', 'vicinity': 'River District', 'rating': 4.5, 'user_ratings_total': 178, 'types': ['park'], 'photos': ['https://via.placeholder.com/400x300'], 'price_level': 0},
            {'place_id': 'p2', 'name': 'Central Gardens', 'vicinity': 'City Center', 'rating': 4.3, 'user_ratings_total': 234, 'types': ['park'], 'photos': ['https://via.placeholder.com/400x300'], 'price_level': 0},
        ],
        'cinema': [
            {'place_id': 'ci1', 'name': 'Grand Theater', 'vicinity': 'Entertainment District', 'rating': 4.2, 'user_ratings_total': 145, 'types': ['movie_theater'], 'photos': ['https://via.placeholder.com/400x300'], 'price_level': 2},
            {'place_id': 'ci2', 'name': 'Multiplex Cinema', 'vicinity': 'Shopping Center', 'rating': 4.0, 'user_ratings_total': 298, 'types': ['movie_theater'], 'photos': ['https://via.placeholder.com/400x300'], 'price_level': 2},
        ]
    }
    
    return mock_places.get(activity_type, mock_places.get('restaurant', []))