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

load_dotenv()

OPENWEATHERMAP_API_KEY = os.getenv('OPENWEATHERMAP_API_KEY')
openai.api_key = os.getenv('OPENAI_API_KEY')
# # Create your views here.
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
                # Cache the result for 15 minutes (900 seconds)
                cache.set(cache_key, weather_data, 900)
            else:
                return JsonResponse({'error': 'Failed to fetch weather data'}, status=500)

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
        cached_activity = cache.get(cache_key)
        if cached_activity:
            return JsonResponse({'activity': cached_activity})

        # 2. Get weather data (from your existing cached function)
        weather_data = get_weather_data(latitude, longitude)
        if 'error' in weather_data:
            return JsonResponse(weather_data, status=500)

        # 3. Call OpenAI API
        try:
            prompt = f"""
            Suggest an activity for someone in {weather_data.get('name', 'this location')} 
            where the weather is {weather_data['weather'][0]['description']}.
            Respond only with the activity type (e.g., 'museum', 'park').
            """
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=20,
            )
            activity = response.choices[0].message.content.strip().lower()
            
            # 4. Validate and cache the activity
            valid_activities = ['park', 'museum', 'cafe', 'cinema', 'beach']
            if not any(valid in activity for valid in valid_activities):
                activity = "park"  # Default fallback
            
            # Cache for 1 hour (3600 seconds)
            cache.set(cache_key, activity, 3600)
            
            return JsonResponse({'activity': activity})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


# Helper functions
def get_time_of_day(timezone_offset):
    # Convert UTC+timezone_offset to local time (simplified)
    from datetime import datetime
    utc_time = datetime.utcnow()
    local_time = utc_time + timedelta(seconds=timezone_offset)
    return "morning" if 5 <= local_time.hour < 12 else "afternoon" if 12 <= local_time.hour < 17 else "evening"


def get_weather_data(latitude, longitude):
    # Reuse your existing weather caching logic
    cache_key = f'weather_{latitude}_{longitude}'
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data