from django.db import models
from django.conf import settings


    
class ActivityHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=100)  # e.g., 'swipe', 'click'
    activity_id = models.CharField(max_length=100)    # ID of the item interacted with
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'activity_id', 'activity_type')  # Prevent duplicates

    def __str__(self):
        return f"{self.user.username} - {self.activity_type} - {self.activity_id}"
    

class UserPreferences(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='preferences')
    preferred_activity_types = models.JSONField(default=list)  # Store a list of preferred types

    def __str__(self):
        return f"{self.user.username}'s Preferences"