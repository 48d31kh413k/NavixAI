"""
NavixAI Database Models

This module defines the data models for the NavixAI application, including:
- ActivityHistory: Tracks user interactions with activities and places
- UserPreferences: Stores user preference data and personalization settings

The models support the AI-powered recommendation system by storing user behavior
patterns and preference data that influences future activity suggestions.
"""

from django.db import models
from django.conf import settings


class ActivityHistory(models.Model):
    """
    Tracks user interaction history with activities and places.
    
    This model stores every user interaction to build a comprehensive
    activity profile for personalized recommendations. It prevents duplicate
    entries for the same user-activity combination while maintaining temporal
    tracking of user engagement patterns.
    
    Attributes:
        user: Foreign key to Django's User model (AUTH_USER_MODEL)
        activity_type: Type of activity interaction (e.g., 'swipe', 'click', 'like', 'dislike')
        activity_id: Unique identifier for the activity or place interacted with
        timestamp: Automatic timestamp when the interaction occurred
        
    Meta:
        unique_together: Ensures no duplicate entries for same user+activity+type combination
    """
    
    # Foreign key relationship to the User model
    # CASCADE delete ensures history is removed when user is deleted
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='activities',
        help_text="The user who performed this activity interaction"
    )
    
    # Type of interaction - supports various engagement patterns
    activity_type = models.CharField(
        max_length=100,
        help_text="Type of user interaction (swipe, click, like, dislike, etc.)"
    )
    
    # Identifier for the specific activity or place
    activity_id = models.CharField(
        max_length=100,
        help_text="Unique identifier for the activity, place, or content item"
    )
    
    # Automatic timestamp for temporal analysis of user behavior
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="When this interaction occurred"
    )

    class Meta:
        # Prevent duplicate entries for the same user-activity-type combination
        unique_together = ('user', 'activity_id', 'activity_type')
        ordering = ['-timestamp']  # Most recent interactions first
        verbose_name = "Activity History"
        verbose_name_plural = "Activity Histories"

    def __str__(self):
        """Human-readable representation of the activity history entry."""
        return f"{self.user.username} - {self.activity_type} - {self.activity_id} ({self.timestamp.strftime('%Y-%m-%d %H:%M')})"
    

class UserPreferences(models.Model):
    """
    Stores user preference data for personalized recommendations.
    
    This model maintains user-specific preference settings including
    preferred activity types, locations, and personalization controls.
    The JSONField allows flexible storage of complex preference data
    while maintaining database performance.
    
    Attributes:
        user: One-to-one relationship with Django User model
        preferred_activity_types: JSON list of activity types the user prefers
        
    The model supports the AI recommendation engine by providing
    user preference context for activity suggestion algorithms.
    """
    
    # One-to-one relationship ensures each user has exactly one preference record
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='preferences',
        help_text="The user these preferences belong to"
    )
    
    # Flexible JSON storage for preferred activity types
    # Allows dynamic expansion of preference categories without schema changes
    preferred_activity_types = models.JSONField(
        default=list,
        help_text="List of preferred activity categories (hiking, dining, culture, etc.)"
    )

    class Meta:
        verbose_name = "User Preferences"
        verbose_name_plural = "User Preferences"

    def __str__(self):
        """Human-readable representation of the user preferences."""
        return f"{self.user.username}'s Preferences ({len(self.preferred_activity_types)} types)"
    
    def add_preferred_activity(self, activity_type):
        """
        Add a new preferred activity type if not already present.
        
        Args:
            activity_type (str): The activity type to add to preferences
            
        Returns:
            bool: True if added, False if already existed
        """
        if activity_type not in self.preferred_activity_types:
            self.preferred_activity_types.append(activity_type)
            self.save()
            return True
        return False
    
    def remove_preferred_activity(self, activity_type):
        """
        Remove an activity type from preferences.
        
        Args:
            activity_type (str): The activity type to remove
            
        Returns:
            bool: True if removed, False if not found
        """
        if activity_type in self.preferred_activity_types:
            self.preferred_activity_types.remove(activity_type)
            self.save()
            return True
        return False