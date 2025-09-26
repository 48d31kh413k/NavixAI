# NavixAI 🗺️

**AI-Powered Activity Discovery Platform with Real-Time Intelligence**

NavixAI is a sophisticated, full-stack activity recommendation system that leverages artificial intelligence, real-time weather data, and advanced location services to provide personalized activity suggestions. Built with modern web technologies and comprehensive API integrations, it offers users intelligent, contextual recommendations for discovering the best activities, restaurants, and attractions in their area.

![NavixAI Dashboard](Dashboard.jpg)

## 🚀 **Application Overview**

NavixAI combines multiple cutting-edge technologies to create a seamless activity discovery experience:
- **AI-Powered Recommendations**: OpenAI GPT integration for contextual activity suggestions
- **Real-Time Weather Intelligence**: Weather-aware recommendations that adapt to current conditions
- **Advanced Location Services**: Google Places API and Distance Matrix for accurate location data
- **Personalization Engine**: Machine learning-based preference tracking and suggestion refinement
- **Multi-Modal Travel Intelligence**: Real-time travel times and distances for optimal route planning

## 🏗️ **Architecture & Technology Stack**

### **Frontend Architecture**
```
React 18.2+ (Modern Functional Components with Hooks)
├── Components/
│   ├── Dashboard.js         # Main activity discovery interface
│   ├── PhotoCarousel.js     # Interactive image carousel with fallback handling
│   ├── PlaceDetail.js       # Comprehensive place information display
│   ├── Settings.js          # User preference and configuration management
│   ├── UserPreferences.js   # Personalization and like/dislike tracking
│   └── ActivitySelector.js  # Category filtering and preference controls
├── Utils/
│   ├── UnitConverter.js     # International unit conversion (temperature, distance, speed)
│   └── UserPreferences.js   # Client-side preference storage and management
└── Styling/
    └── *.css               # Responsive CSS with modern design patterns
```

### **Backend Architecture**
```
Django 5.1+ REST API with Advanced Caching
├── API Layer/
│   ├── views.py            # Core API endpoints with comprehensive error handling
│   ├── models.py           # User activity history and preference data models
│   └── urls.py             # RESTful routing configuration
├── External Integrations/
│   ├── OpenAI GPT-3.5      # Intelligent activity suggestion generation
│   ├── Google Maps APIs     # Places search, photos, and distance calculations
│   └── OpenWeatherMap API   # Real-time weather context
└── Infrastructure/
    ├── Django Cache Framework # Performance optimization with intelligent caching
    ├── CORS Configuration     # Cross-origin resource sharing for frontend integration
    └── Environment Management # Secure API key and configuration handling
```

### **Core Technologies**

#### **Frontend Stack**
- **React 18.2+**: Modern component-based architecture with concurrent features
- **React Router 6+**: Declarative navigation with dynamic route handling
- **Axios**: HTTP client with request/response interceptors and error handling
- **Modern CSS3**: Flexbox/Grid layouts, CSS custom properties, and responsive design
- **LocalStorage API**: Client-side data persistence for preferences and history

#### **Backend Stack**
- **Django 5.1+**: High-level Python web framework with ORM and admin interface
- **Django REST Framework**: Powerful toolkit for building web APIs with serialization
- **SQLite/PostgreSQL**: Lightweight development database with production scalability
- **Python 3.9+**: Modern Python with type hints and advanced features
- **Concurrent Processing**: ThreadPoolExecutor for parallel API calls and performance optimization

#### **External Service Integration**
- **OpenAI API**: GPT-3.5-turbo for contextual, weather-aware activity recommendations
- **Google Places API**: Comprehensive location data, photos, ratings, and reviews
- **Google Distance Matrix API**: Real-time travel time and distance calculations
- **OpenWeatherMap API**: Current weather conditions and forecasting data

## 🎯 **Key Features & Capabilities**

### **🤖 Intelligent Recommendation Engine**
- **AI-Powered Suggestions**: OpenAI GPT generates contextually appropriate activities based on weather, location, and time
- **Weather-Contextual Logic**: Outdoor activities prioritized in good weather, indoor alternatives suggested during poor conditions
- **Preference Learning**: Continuous improvement based on user interactions and feedback
- **Category Intelligence**: Balanced recommendations across outdoor adventures, cultural experiences, dining, and relaxation

### **📍 Advanced Location Services**
- **Precise Geolocation**: HTML5 Geolocation API with fallback handling for location detection
- **Real-Time Travel Intelligence**: Google Distance Matrix integration for accurate travel times and distances
- **Multi-Modal Transportation**: Walking and driving options with time/distance calculations
- **Dynamic Radius**: Configurable search radius for activity discovery (default 15km)

### **🌤️ Weather-Aware Intelligence**
- **Real-Time Weather Integration**: OpenWeatherMap API for current conditions
- **Contextual Activity Filtering**: Weather-appropriate activity suggestions
- **Seasonal Adaptability**: Algorithm adjusts recommendations based on temperature, precipitation, and conditions
- **Cache Optimization**: Weather data cached for performance with appropriate refresh intervals

### **👤 Personalization & User Experience**
- **Preference Tracking**: Sophisticated like/dislike system with weighted preference scoring
- **Activity History**: Complete user interaction logging for personalization improvement
- **Customizable Categories**: User-controlled activity type preferences (outdoor, indoor, cultural, culinary)
- **International Support**: Unit conversion system supporting metric and imperial measurements

### **🎨 Modern User Interface**
- **Responsive Design**: Mobile-first approach with seamless desktop scaling
- **Interactive Photo Carousels**: Rich visual content with loading states and error handling
- **Smooth Animations**: CSS transitions and transforms for enhanced user experience
- **Accessibility Features**: Semantic HTML, ARIA labels, and keyboard navigation support

### **⚡ Performance & Scalability**
- **Intelligent Caching**: Multi-layer caching strategy for API responses and user data
- **Concurrent Processing**: Parallel API calls for improved response times
- **Error Handling**: Comprehensive fallback systems for API failures and network issues
- **Mock Data Integration**: Development and testing support with realistic fallback data

## 📁 **Project Structure & Organization**

```
new-navix/                          # Root project directory
├── 📱 frontend/                    # React application
│   ├── 📄 public/                  # Static assets and HTML template
│   │   ├── index.html              # Main HTML template with meta tags
│   │   ├── favicon.ico             # Application icon
│   │   └── manifest.json           # PWA configuration
│   ├── 🧩 src/                     # Source code directory
│   │   ├── 📱 components/          # React components
│   │   │   ├── Dashboard.js        # Main activity discovery interface (687 lines)
│   │   │   ├── PhotoCarousel.js    # Image carousel with fallback handling
│   │   │   ├── PlaceDetail.js      # Detailed place information display
│   │   │   ├── Settings.js         # User preference configuration
│   │   │   ├── UserPreferences.js  # Like/dislike tracking interface
│   │   │   ├── Sidebar.js          # Navigation and menu component
│   │   │   └── *.css              # Component-specific styles
│   │   ├── 🛠️ utils/               # Utility functions
│   │   │   ├── UnitConverter.js    # Temperature, distance, speed conversion
│   │   │   └── UserPreferences.js  # Client-side preference management (237 lines)
│   │   ├── App.js                  # Root application component with routing
│   │   ├── index.js                # Application entry point with React 18 features
│   │   └── App.css                 # Global application styles
│   ├── package.json                # Dependencies and build configuration
│   └── README.md                   # Frontend-specific documentation
├── 🔧 backend/                     # Django REST API
│   ├── 🎯 api/                     # Main API application
│   │   ├── models.py               # Data models for user tracking and preferences
│   │   ├── views.py                # API endpoints and business logic (1040+ lines)
│   │   ├── urls.py                 # URL routing configuration
│   │   ├── admin.py                # Django admin interface configuration
│   │   ├── apps.py                 # Application configuration
│   │   ├── tests.py                # Unit tests and API testing
│   │   └── migrations/             # Database schema migrations
│   ├── ⚙️ navix/                   # Django project settings
│   │   ├── settings.py             # Application configuration and API keys
│   │   ├── urls.py                 # Root URL configuration
│   │   ├── wsgi.py                 # WSGI application interface
│   │   └── asgi.py                 # ASGI application interface
│   ├── manage.py                   # Django management script
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example               # Environment variable template
│   └── db.sqlite3                 # SQLite database (development)
├── 📸 Dashboard.jpg                # Application screenshots
├── 📸 Place\ Details.jpg           # Feature demonstrations
├── 📸 Settings.jpg                 # UI examples
└── 📖 README.md                   # Comprehensive project documentation (this file)
```

## 🔧 **API Documentation & Endpoints**

### **Core Activity Endpoints**

#### **POST /api/activity-suggestion/**
**Primary activity recommendation endpoint with AI intelligence**

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
    "activities": [
        {
            "activity_name": "restaurant",
            "places": [
                {
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
                }
            ]
        }
    ],
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

#### **GET /api/place-details/{place_id}/**
**Comprehensive place information with photos and reviews**

```javascript
// Response
{
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "name": "Central Park",
    "formatted_address": "New York, NY 10024, USA",
    "formatted_phone_number": "(212) 310-6600",
    "website": "https://centralparknyc.org",
    "rating": 4.7,
    "user_ratings_total": 142853,
    "photos": ["https://maps.googleapis.com/maps/api/place/photo?..."],
    "opening_hours": {
        "open_now": true,
        "weekday_text": ["Monday: 6:00 AM – 1:00 AM", "..."]
    },
    "reviews": [
        {
            "author_name": "John Smith",
            "rating": 5,
            "text": "Beautiful park with amazing views!",
            "relative_time_description": "2 weeks ago"
        }
    ]
}
```

### **User Preference Management**

#### **POST /api/user-preference/**
**Update user activity preferences (like/dislike)**

```javascript
// Request
{
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
    "preference": "like", // or "dislike"
    "place_name": "Central Park",
    "activity_type": "park"
}
```

#### **GET /api/user-preferences/**
**Retrieve all user preferences for personalization**

#### **DELETE /api/user-preference/{place_id}/**
**Remove specific user preference**

### **Legacy & Utility Endpoints**

#### **POST /api/suggestions/** 
**Weather-based activity suggestions (legacy)**

#### **GET /api/test/**
**API health check and connectivity test**

## ⚙️ **Configuration & Environment Setup**

### **Environment Variables (.env)**

```bash
# Core API Keys (Required)
OPENAI_API_KEY=sk-your-openai-api-key-here
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
OPENWEATHERMAP_API_KEY=your-openweathermap-api-key-here

# Django Configuration
SECRET_KEY=your-django-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database Configuration (Optional)
DATABASE_URL=sqlite:///db.sqlite3

# CORS Configuration for Frontend Integration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# API Performance Settings (Optional)
OPENAI_MODEL=gpt-3.5-turbo
GOOGLE_PLACES_RADIUS=15000
WEATHER_CACHE_TIMEOUT=3600
ACTIVITY_CACHE_TIMEOUT=3600
```

### **Django Settings Configuration**

```python
# backend/navix/settings.py

# CORS Settings for Frontend Integration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",    # React development server
    "http://127.0.0.1:3000",   # Alternative localhost
]

# Cache Configuration for Performance
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
        'TIMEOUT': 3600,  # 1 hour default cache timeout
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
            'CULL_FREQUENCY': 3,
        }
    }
}

# API Integration Settings
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
    ],
}
```

## 🚀 **Installation & Development Setup**

### **Prerequisites**
- **Node.js 16+** and **npm 7+** for frontend development
- **Python 3.9+** and **pip** for backend development
- **Git** for version control and repository management
- **API Keys** for external service integration:
  - OpenAI API key for GPT-3.5-turbo access
  - Google Maps API key with Places and Distance Matrix API enabled
  - OpenWeatherMap API key for weather data

### **Quick Start Guide**

#### **1. Repository Setup**
```bash
# Clone the repository
git clone https://github.com/48d31kh413k/new-navix.git
cd new-navix

# Verify project structure
ls -la  # Should show backend/, frontend/, and documentation files
```

#### **2. Backend Configuration & Launch**
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv navix_env
source navix_env/bin/activate  # On Windows: navix_env\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env file with your API keys (see Configuration section above)

# Initialize database
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional, for Django admin)
python manage.py createsuperuser

# Launch development server
python manage.py runserver  # Runs on http://127.0.0.1:8000
```

#### **3. Frontend Configuration & Launch**
```bash
# Navigate to frontend directory (in new terminal)
cd frontend

# Install Node.js dependencies
npm install

# Verify React dependencies
npm list react react-dom  # Should show React 18.2+

# Launch development server
npm start  # Runs on http://localhost:3000
```

#### **4. Application Access**
- **Frontend Interface**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000
- **Django Admin**: http://127.0.0.1:8000/admin
- **API Documentation**: Available in this README

### **Development Workflow**

#### **Frontend Development**
```bash
# Start development with hot reload
npm start

# Run linting and code formatting
npm run lint

# Build for production
npm run build

# Serve production build locally
npm run serve
```

#### **Backend Development**
```bash
# Activate virtual environment
source navix_env/bin/activate

# Run development server with auto-reload
python manage.py runserver

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Access Django shell for debugging
python manage.py shell

# Collect static files for production
python manage.py collectstatic
```

#### **API Testing & Development**
```bash
# Test API endpoints with curl
curl -X GET "http://127.0.0.1:8000/api/test/"

# Test activity suggestions
curl -X POST "http://127.0.0.1:8000/api/activity-suggestion/" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 40.7128, "longitude": -74.0060, "max_activities": 5}'

# Monitor server logs for debugging
python manage.py runserver --verbosity=2
```

## 🔨 **Build & Deployment**

### **Production Build Process**

#### **Frontend Production Build**
```bash
cd frontend

# Install production dependencies
npm ci --only=production

# Create optimized production build
npm run build

# Verify build output
ls -la build/  # Should contain optimized HTML, CSS, and JS files

# Optional: Test production build locally
npm install -g serve
serve -s build -l 3000
```

#### **Backend Production Configuration**
```python
# backend/navix/settings.py (Production additions)

# Security settings for production
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']

# Database configuration for production
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

# Static files configuration
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Cache configuration with Redis (recommended for production)
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

### **Deployment Options**

#### **1. Traditional Server Deployment**
```bash
# Install production dependencies
pip install gunicorn redis

# Collect static files
python manage.py collectstatic --noinput

# Run with Gunicorn (production WSGI server)
gunicorn navix.wsgi:application --bind 0.0.0.0:8000 --workers 4

# Serve frontend with Nginx
# Copy build/ contents to /var/www/navix/
sudo cp -r frontend/build/* /var/www/navix/
```

#### **2. Docker Deployment**
```dockerfile
# Dockerfile.backend
FROM python:3.9
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["gunicorn", "navix.wsgi:application", "--bind", "0.0.0.0:8000"]

# Dockerfile.frontend  
FROM node:16 AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
```

#### **3. Cloud Platform Deployment**
```yaml
# Example: Railway deployment configuration
# railway.toml
[build]
buildCommand = "cd backend && pip install -r requirements.txt"
startCommand = "cd backend && python manage.py runserver 0.0.0.0:$PORT"

[env]
PYTHONPATH = "/app/backend"
```

### **Environment-Specific Configurations**

#### **Development Environment**
```bash
# .env.development
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
DATABASE_URL=sqlite:///db.sqlite3
```

#### **Production Environment**
```bash
# .env.production
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com
DATABASE_URL=postgresql://user:pass@localhost:5432/navix_prod
REDIS_URL=redis://localhost:6379
```

## 🔍 **API Performance & Optimization**

### **Caching Strategy**
The application implements a multi-layer caching system for optimal performance:

```python
# Cache Configuration
CACHE_TIMEOUTS = {
    'weather_data': 1800,      # 30 minutes
    'activity_suggestions': 3600,  # 1 hour
    'place_details': 7200,     # 2 hours
    'user_preferences': 86400, # 24 hours
}

# Cache Key Patterns
CACHE_KEYS = {
    'weather': 'weather_{lat}_{lng}',
    'activities': 'multi_activity_{lat}_{lng}_{max}_{prefs}',
    'place': 'place_details_{place_id}',
    'user_prefs': 'user_preferences_{user_id}',
}
```

### **API Rate Limiting & Quotas**
```python
# External API Usage Optimization
API_QUOTAS = {
    'openai': {
        'requests_per_minute': 60,
        'tokens_per_request': 4000,
        'fallback_enabled': True,
    },
    'google_places': {
        'requests_per_day': 100000,
        'concurrent_requests': 10,
        'fallback_enabled': True,
    },
    'openweathermap': {
        'requests_per_minute': 60,
        'cache_duration': 1800,
    }
}
```

### **Database Optimization**
```python
# Model Optimizations
class ActivityHistory(models.Model):
    # ... fields ...
    
    class Meta:
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['activity_type', '-timestamp']),
        ]
        ordering = ['-timestamp']

# Query Optimizations
def get_user_activity_history(user_id, limit=50):
    return ActivityHistory.objects.select_related('user')\
        .filter(user_id=user_id)\
        .order_by('-timestamp')[:limit]
```

## 🧪 **Testing & Quality Assurance**

### **Frontend Testing**
```bash
# Unit tests with Jest
npm test

# Integration tests
npm run test:integration

# End-to-end tests with Cypress
npm run test:e2e

# Code coverage report
npm run test:coverage
```

### **Backend Testing**
```bash
# Django unit tests
python manage.py test

# API endpoint testing
python manage.py test api.tests

# Coverage report
coverage run --source='.' manage.py test
coverage report
coverage html
```

### **API Testing Examples**
```python
# backend/api/tests.py
class ActivitySuggestionAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
    def test_activity_suggestion_success(self):
        data = {
            'latitude': 40.7128,
            'longitude': -74.0060,
            'max_activities': 5
        }
        response = self.client.post('/api/activity-suggestion/', data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('activities', response.data)
        self.assertIn('weather', response.data)
        
    def test_invalid_coordinates(self):
        data = {'latitude': 'invalid', 'longitude': -74.0060}
        response = self.client.post('/api/activity-suggestion/', data, format='json')
        self.assertEqual(response.status_code, 400)
```

## 📊 **Monitoring & Analytics**

### **Performance Monitoring**
```python
# Custom middleware for API monitoring
class APIMonitoringMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration = time.time() - start_time
        
        # Log API performance metrics
        logger.info(f"API {request.path} - {response.status_code} - {duration:.2f}s")
        return response
```

### **Error Tracking & Logging**
```python
# Comprehensive logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'navix.log',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'api': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## 🤝 **Contributing & Development Guidelines**

### **Code Standards**
- **Python**: Follow PEP 8 style guidelines with Black code formatting
- **JavaScript**: ESLint configuration with Airbnb style guide
- **Documentation**: Comprehensive docstrings and JSDoc comments
- **Git**: Conventional commit messages with clear, descriptive titles

### **Development Process**
1. **Fork** the repository and create a feature branch
2. **Implement** changes with comprehensive documentation
3. **Test** thoroughly with unit and integration tests
4. **Submit** pull request with detailed description and testing evidence

### **Architecture Decisions**
- **Separation of Concerns**: Clear boundaries between frontend, backend, and external services
- **Scalability**: Designed for horizontal scaling with stateless API architecture
- **Maintainability**: Modular code structure with comprehensive documentation
- **Security**: Environment-based configuration with secure API key management

## 📄 **License & Legal**

This project is licensed under the MIT License. See LICENSE file for details.

**Third-Party Services**: This application integrates with external APIs (OpenAI, Google Maps, OpenWeatherMap) which have their own terms of service and usage policies.

---

**Built with ❤️ by the NavixAI Team**

For questions, issues, or contributions, please visit our [GitHub repository](https://github.com/48d31kh413k/new-navix) or open an issue.

### **Recent Improvements**
- 🔧 **Removed Search Functionality**: Streamlined interface focusing on category-based discovery
- 🔧 **Simplified Interaction**: Removed like/dislike buttons for cleaner card design
- 🎨 **Enhanced Styling**: Better spacing and typography for travel information display
- ⚡ **Performance Optimization**: Efficient API calls with smart caching strategies

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern component-based UI framework
- **React Router** - Client-side routing and navigation
- **Axios** - HTTP client for API communication
- **CSS3** - Advanced styling with gradients, animations, and responsive design
- **Local Storage** - Client-side preference and history management

### **Backend**
- **Django 4** - Python web framework with REST API
- **Django REST Framework** - API serialization and viewsets
- **SQLite** - Lightweight database for development
- **Django Cache** - Performance optimization for API responses

### **External APIs**
- **OpenAI GPT-3.5** - AI-powered activity suggestions
- **Google Maps API** - Places search, photos, location data, and travel calculations
- **Google Distance Matrix API** - Real-time travel times and distances
- **OpenWeatherMap API** - Real-time weather data integration

### **Development Tools**
- **Git** - Version control and collaboration
- **npm** - Frontend package management
- **pip** - Python package management
- **VS Code** - Development environment

## 🚀 Getting Started

### Prerequisites

Before running NavixAI, ensure you have the following installed:

- **Python 3.8+** (Backend)
- **Node.js 16+** (Frontend)
- **npm** or **yarn** (Package manager)
- **Git** (Version control)

### 📋 Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here

# Django Settings
SECRET_KEY=your_django_secret_key_here
DEBUG=True

# Database (Optional - defaults to SQLite)
DATABASE_URL=sqlite:///db.sqlite3
```

### 🔑 API Key Setup

#### 1. **OpenAI API Key**
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and navigate to API Keys
3. Generate a new API key
4. Add to `.env` as `OPENAI_API_KEY`

#### 2. **Google Maps API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
   - Places API (for location search and details)
   - Maps JavaScript API (for map integration)
   - Geocoding API (for address conversion)
   - Distance Matrix API (for travel times and distances)
4. Create credentials (API Key)
5. Add to `.env` as `GOOGLE_MAPS_API_KEY`

#### 3. **OpenWeatherMap API Key**
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key
4. Add to `.env` as `OPENWEATHERMAP_API_KEY`

### 🏃‍♂️ Installation & Setup

#### 1. **Clone the Repository**
```bash
git clone https://github.com/48d31kh413k/new-navix.git
cd new-navix
```

#### 2. **Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file with your API keys (see above)
touch .env

# Run database migrations
python manage.py migrate

# Start Django development server
python manage.py runserver
```

The backend will be available at: `http://localhost:8000`

#### 3. **Frontend Setup**
```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start React development server
npm start
```

The frontend will be available at: `http://localhost:3000`

### 🧪 Testing the Application

1. **Open your browser** to `http://localhost:3000`
2. **Allow location access** when prompted (for location-based recommendations)
3. **Explore the dashboard** to see AI-generated activity suggestions
4. **Customize preferences** in the Settings page
5. **Search and filter** activities using the search bar
6. **View detailed information** by clicking on activity cards

## 📁 Project Structure

```
new-navix/
├── backend/                 # Django REST API
│   ├── api/                # Main API application
│   │   ├── models.py       # Database models
│   │   ├── views.py        # API endpoints and logic
│   │   ├── urls.py         # URL routing
│   │   └── migrations/     # Database migrations
│   ├── navix/              # Django project settings
│   │   ├── settings.py     # Configuration
│   │   └── urls.py         # Main URL routing
│   ├── manage.py           # Django management script
│   └── requirements.txt    # Python dependencies
├── frontend/               # React application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Dashboard.js        # Main activity dashboard
│   │   │   ├── Settings.js         # User preferences
│   │   │   ├── PlaceDetail.js      # Activity details page
│   │   │   ├── PhotoCarousel.js    # Image gallery component
│   │   │   └── *.css              # Component styles
│   │   ├── utils/          # Utility functions
│   │   ├── App.js          # Main application component
│   │   └── index.js        # Application entry point
│   ├── package.json        # Node.js dependencies
│   └── README.md           # Frontend-specific documentation
└── README.md               # This file
```

## 🔧 Configuration

### **Backend Configuration** (`backend/navix/settings.py`)

```python
# CORS settings for frontend integration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React development server
    "http://127.0.0.1:3000",
]

# Cache configuration for API performance
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'TIMEOUT': 3600,  # 1 hour cache
    }
}
```

### **Frontend Configuration** (`frontend/src/`)

The frontend automatically connects to the backend at `http://localhost:8000`. If you need to change this, update the API URLs in the components.

## 🏗️ API Endpoints

### **Activity Suggestions**
- `POST /api/activity-suggestion/` - Get AI-powered activity recommendations with travel times
- `GET /api/suggestions/` - Get weather-based suggestions (legacy)

### **Place Details**
- `GET /api/place-details/{place_id}/` - Get detailed information about a specific place

### **Travel Information**
- **Integrated in activity suggestions** - Travel times and distances calculated automatically
- **Walking & Driving Routes** - Multi-modal transportation options
- **Real-time Calculation** - Live data from Google Distance Matrix API

### **User Preferences**
- `POST /api/user-preference/` - Update user preference (like/dislike)
- `GET /api/user-preferences/` - Get all user preferences
- `DELETE /api/user-preference/{place_id}/` - Delete specific preference

### **System**
- `GET /api/test/` - Health check endpoint

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### **Common Issues**

#### **Backend won't start**
- Ensure all environment variables are set in `.env`
- Check that Python virtual environment is activated
- Verify all dependencies are installed: `pip install -r requirements.txt`

#### **Frontend won't start**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version is 16+

#### **No activity suggestions**
- Verify OpenAI API key is valid and has credits
- Check Google Maps API key has required permissions (Places API, Distance Matrix API)
- Ensure location access is granted in browser

#### **Travel times not displaying**
- Confirm Google Distance Matrix API is enabled in Google Cloud Console
- Check API key quotas and billing settings
- Verify location permissions are granted
- Ensure activities have valid geographic coordinates

#### **Weather data not loading**
- Confirm OpenWeatherMap API key is active
- Check browser console for API errors
- Verify location coordinates are being captured

### **Performance Issues**
- API responses are cached for 1 hour to improve performance
- Large photo carousels may load slowly on slow connections
- Consider reducing `max_places_per_activity` in backend for faster responses

## 🌟 Future Enhancements

- **Mobile App**: React Native implementation
- **Social Features**: Share activities with friends
- **Advanced Filtering**: Price range, distance, rating filters
- **Offline Support**: Cached recommendations for offline use
- **Maps Integration**: Interactive map view of suggested locations
- **Review System**: User-generated reviews and ratings

---

**Made with ❤️ by the NavixAI Team**

For support or questions, please open an issue on GitHub.