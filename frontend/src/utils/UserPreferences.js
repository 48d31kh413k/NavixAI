// User preferences storage utility
class UserPreferences {
    constructor() {
        this.storageKey = 'navix_user_preferences';
        this.historyKey = 'navix_user_history';
        this.loadPreferences();
        this.loadHistory();
    }

    loadPreferences() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.preferences = stored ? JSON.parse(stored) : {
                activities: {}, // activity_name: score (-5 to +5)
                places: {},     // place_id: { score, name, activity_type, timestamp }
                locationTypes: {}, // location type preferences
                settings: {
                    enablePersonalization: true,
                    maxHistoryItems: 100
                }
            };
        } catch (error) {
            console.error('Error loading preferences:', error);
            this.preferences = { activities: {}, places: {}, locationTypes: {}, settings: {} };
        }
    }

    loadHistory() {
        try {
            const stored = localStorage.getItem(this.historyKey);
            this.history = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading history:', error);
            this.history = [];
        }
    }

    savePreferences() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    saveHistory() {
        try {
            // Keep only the most recent items
            const maxItems = this.preferences.settings.maxHistoryItems || 100;
            if (this.history.length > maxItems) {
                this.history = this.history.slice(-maxItems);
            }
            localStorage.setItem(this.historyKey, JSON.stringify(this.history));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    // Activity preference methods
    likeActivity(activityName) {
        if (!this.preferences.activities[activityName]) {
            this.preferences.activities[activityName] = 0;
        }
        this.preferences.activities[activityName] = Math.min(5, this.preferences.activities[activityName] + 1);
        this.savePreferences();
    }

    dislikeActivity(activityName) {
        if (!this.preferences.activities[activityName]) {
            this.preferences.activities[activityName] = 0;
        }
        this.preferences.activities[activityName] = Math.max(-5, this.preferences.activities[activityName] - 1);
        this.savePreferences();
    }

    getActivityScore(activityName) {
        return this.preferences.activities[activityName] || 0;
    }

    // Place preference methods (Like-only system)
    likePlace(place, activityType) {
        const placeData = {
            score: (this.preferences.places[place.place_id]?.score || 0) + 1,
            name: place.name,
            activityType: activityType,
            timestamp: Date.now(),
            vicinity: place.vicinity,
            rating: place.rating
        };
        
        this.preferences.places[place.place_id] = placeData;
        this.likeActivity(activityType); // Also boost activity preference
        this.addToHistory('like', place, activityType);
        this.savePreferences();
    }

    // Deprecated: Use like-only system
    dislikePlace(place, activityType) {
        console.warn('dislikePlace is deprecated - using like-only system');
        // For backward compatibility, don't actually dislike but just ignore
        return;
    }

    isPlaceLiked(placeId) {
        return this.getPlaceScore(placeId) > 0;
    }

    getPlaceScore(placeId) {
        return this.preferences.places[placeId]?.score || 0;
    }

    // History methods
    addToHistory(action, place, activityType) {
        const historyItem = {
            id: Date.now(),
            action: action, // 'like', 'dislike', 'visit'
            place: {
                place_id: place.place_id,
                name: place.name,
                vicinity: place.vicinity,
                rating: place.rating,
                types: place.types || []
            },
            activityType: activityType,
            timestamp: Date.now(),
            date: new Date().toLocaleDateString()
        };

        this.history.unshift(historyItem); // Add to beginning
        this.saveHistory();
    }

    getHistory(limit = 50) {
        return this.history.slice(0, limit);
    }

    getLikedPlaces() {
        return Object.entries(this.preferences.places)
            .filter(([_, data]) => data.score > 0)
            .map(([placeId, data]) => ({ placeId, ...data }))
            .sort((a, b) => b.score - a.score);
    }

    getPreferredActivities() {
        return Object.entries(this.preferences.activities)
            .filter(([_, score]) => score > 0)
            .sort(([_, a], [__, b]) => b - a)
            .map(([activity, score]) => ({ activity, score }));
    }

    // Recommendation methods
    getPersonalizedActivityScore(activityName) {
        const baseScore = this.getActivityScore(activityName);
        
        // Boost score based on related liked places
        const relatedPlaces = Object.values(this.preferences.places)
            .filter(place => place.activityType === activityName && place.score > 0);
        
        const placeBoost = relatedPlaces.length * 0.5;
        
        return baseScore + placeBoost;
    }

    sortActivitiesByPreference(activities) {
        if (!this.preferences.settings.enablePersonalization) {
            return activities;
        }

        return activities.sort((a, b) => {
            const scoreA = this.getPersonalizedActivityScore(a.activity_name);
            const scoreB = this.getPersonalizedActivityScore(b.activity_name);
            return scoreB - scoreA;
        });
    }

    // Settings
    updateSettings(newSettings) {
        this.preferences.settings = { ...this.preferences.settings, ...newSettings };
        this.savePreferences();
    }

    getSettings() {
        return this.preferences.settings;
    }

    // Clear data
    clearHistory() {
        this.history = [];
        this.saveHistory();
    }

    clearPreferences() {
        this.preferences = { activities: {}, places: {}, locationTypes: {}, settings: {} };
        this.savePreferences();
    }

    // Export/Import for backup
    exportData() {
        return {
            preferences: this.preferences,
            history: this.history,
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        try {
            if (data.preferences) {
                this.preferences = data.preferences;
                this.savePreferences();
            }
            if (data.history) {
                this.history = data.history;
                this.saveHistory();
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

// Create a singleton instance
const userPreferences = new UserPreferences();

export default userPreferences;