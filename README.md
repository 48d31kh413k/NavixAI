# NavixAI

**AI-Powered Activity Discovery Platform**

A full-stack application that leverages AI, real-time weather data, and location services to provide intelligent activity recommendations. The system integrates OpenAI GPT, Google Maps APIs, and weather services to deliver contextual, personalized suggestions for activities, restaurants, and attractions.

## Architecture Overview

NavixAI implements a modern separation-of-concerns architecture with React frontend, Django REST API backend, and external service integrations for AI processing, location data, and weather information.

## Technology Stack

### Frontend
- **React 18.2+**: Component-based architecture with modern hooks
- **React Router 6+**: Client-side navigation and routing
- **Axios**: HTTP client with interceptors and error handling
- **CSS3**: Modern styling with flexbox, grid, and responsive design
- **LocalStorage API**: Client-side data persistence

### Backend  
- **Django 5.1+**: Python web framework with ORM
- **Django REST Framework**: API development with serialization
- **SQLite/PostgreSQL**: Database with migration support
- **Python 3.9+**: Modern Python with type annotations
- **Concurrent Processing**: ThreadPoolExecutor for parallel API calls

### External Services
- **OpenAI API**: GPT-3.5-turbo for intelligent recommendations
- **Google Places API**: Location data, photos, ratings, and reviews  
- **Google Distance Matrix API**: Real-time travel time calculations
- **OpenWeatherMap API**: Current weather conditions

## Project Structure

```
NavixAI/
├── backend/
│   ├── api/
│   │   ├── models.py          # Data models for user tracking
│   │   ├── views.py           # API endpoints and business logic
│   │   ├── urls.py            # URL routing configuration
│   │   └── migrations/        # Database schema migrations
│   ├── navix/
│   │   ├── settings.py        # Django configuration
│   │   └── urls.py            # Root URL configuration
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js           # Main activity interface
│   │   │   ├── PhotoCarousel.js       # Image carousel component  
│   │   │   ├── PlaceDetail.js         # Detailed place information
│   │   │   ├── Settings.js            # User preference management
│   │   │   └── UserPreferences.js     # Like/dislike tracking
│   │   ├── utils/
│   │   │   ├── UnitConverter.js       # Unit conversion utilities
│   │   │   └── UserPreferences.js     # Client-side preference storage
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Core Features

### AI-Powered Recommendations
- OpenAI GPT integration for contextual activity suggestions
- Weather-aware recommendations (outdoor activities in good weather, indoor alternatives otherwise)
- Continuous learning from user interactions and feedback
- Balanced recommendations across activity categories

### Advanced Location Services  
- HTML5 Geolocation with fallback handling
- Google Distance Matrix integration for accurate travel times
- Walking and driving route options with time/distance calculations
- Configurable search radius (default 15km)

### Weather Integration
- Real-time weather data from OpenWeatherMap API
- Weather-appropriate activity filtering
- Seasonal adaptation based on temperature and conditions
- Performance-optimized caching with appropriate refresh intervals

### User Personalization
- Like/dislike system with weighted preference scoring
- Complete activity history logging
- Customizable category preferences (outdoor, indoor, cultural, culinary)
- International unit conversion support

### Performance Optimization
- Multi-layer caching strategy for API responses
- Concurrent processing for parallel API calls
- Comprehensive error handling with fallback systems
- Mock data support for development and testing

## API Endpoints

### Activity Suggestions
**POST /api/activity-suggestion/**  
Primary recommendation endpoint with AI intelligence

```javascript
// Request
{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "max_activities": 8,
    "activities": {
        "outdoorAdventure": true,
        "indoorRelaxation": false,
        "culturalExploration": true,
        "culinaryDelights": true
    }
}

// Response
{
    "activities": [{
        "activity_name": "restaurant",
        "places": [{
            "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
            "name": "Joe's Pizza",
            "vicinity": "123 Broadway, New York",
            "rating": 4.5,
            "user_ratings_total": 1250,
            "photos": ["https://maps.googleapis.com/..."],
            "walking_time": "8 mins",
            "driving_time": "3 mins",
            "walking_distance": "0.6 km",
            "driving_distance": "0.4 km",
            "types": ["restaurant", "food", "establishment"]
        }]
    }],
    "weather": {
        "name": "New York",
        "main": {"temp": 22, "humidity": 65},
        "weather": [{"description": "sunny", "main": "Clear"}]
    },
    "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "city": "New York"
    }
}
```

**GET /api/place-details/{place_id}/**  
Comprehensive place information with photos and reviews

### User Preference Management
- **POST /api/user-preference/** - Update user activity preferences
- **GET /api/user-preferences/** - Retrieve all user preferences  
- **DELETE /api/user-preference/{place_id}/** - Remove specific preference

### System Endpoints
- **GET /api/test/** - API health check and connectivity test
## Environment Setup

### Prerequisites
- Node.js 16+ and npm 7+ for frontend development
- Python 3.9+ and pip for backend development  
- API keys for external services:
  - OpenAI API key for GPT-3.5-turbo access
  - Google Maps API key with Places and Distance Matrix API enabled
  - OpenWeatherMap API key for weather data

### Environment Variables
Create a `.env` file in the `backend/` directory:

```bash
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here

# Django Configuration
SECRET_KEY=your_django_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```
## Installation

### Quick Start

#### 1. Clone and Setup Backend
```bash
git clone https://github.com/48d31kh413k/NavixAI.git
cd NavixAI/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (create .env file)
# Add your API keys as shown in Environment Setup section

# Initialize database
python manage.py migrate

# Start backend server
python manage.py runserver  # Runs on http://127.0.0.1:8000
```

#### 2. Setup Frontend
```bash
# New terminal
cd NavixAI/frontend

# Install dependencies
npm install

# Start development server  
npm start  # Runs on http://localhost:3000
```

### Development Workflow

#### Backend Development
```bash
# Run with auto-reload
python manage.py runserver

# Create/apply database migrations
python manage.py makemigrations
python manage.py migrate

# Django shell for debugging
python manage.py shell
```

#### Frontend Development  
```bash
# Development with hot reload
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Performance and Caching

The application implements intelligent caching strategies to optimize API performance:

### Cache Configuration
```python
CACHE_TIMEOUTS = {
    'weather_data': 1800,      # 30 minutes
    'activity_suggestions': 3600,  # 1 hour  
    'place_details': 7200,     # 2 hours
    'user_preferences': 86400, # 24 hours
}
```

### API Rate Limiting
- OpenAI: 60 requests/minute with fallback handling
- Google Places: 100,000 requests/day with concurrent request limiting
- OpenWeatherMap: 60 requests/minute with 30-minute cache duration

## Testing

### Backend Testing
```bash
# Run Django unit tests
python manage.py test

# Test specific app
python manage.py test api.tests

# Generate coverage report
coverage run --source='.' manage.py test
coverage report
```

### Frontend Testing
```bash
# Run Jest unit tests
npm test

# Generate coverage report
npm run test:coverage
```

## Deployment

### Production Configuration

#### Django Settings (Production)
```python
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']

# Use PostgreSQL for production
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'navix_production',
        'USER': 'navix_user',
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

#### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "navix.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## Contributing

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript
- Write comprehensive docstrings and comments
- Include unit tests for new features
- Use conventional commit messages

### Process
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`  
5. Submit pull request

## Troubleshooting

### Common Issues

**Backend won't start:**
- Verify all environment variables are set in `.env`
- Check Python virtual environment is activated
- Ensure dependencies are installed: `pip install -r requirements.txt`

**Frontend won't start:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Verify Node.js version is 16+

**No activity suggestions:**
- Verify OpenAI API key is valid with available credits
- Check Google Maps API key has required permissions
- Ensure location access is granted in browser

**Travel times not displaying:**
- Confirm Google Distance Matrix API is enabled
- Check API key quotas and billing settings
- Verify location permissions are granted

## License

This project is licensed under the MIT License. See LICENSE file for details.

**Third-Party Services**: This application integrates with external APIs (OpenAI, Google Maps, OpenWeatherMap) which have their own terms of service and usage policies.