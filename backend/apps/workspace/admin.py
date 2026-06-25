from django.contrib import admin
from .models import Task, TaskAttachment, ActivityFeed

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'assigned_to', 'deadline']
    list_filter = ['status', 'priority']
    search_fields = ['title', 'project__title']

@admin.register(ActivityFeed)
class ActivityFeedAdmin(admin.ModelAdmin):
    list_display = ['action_type', 'actor', 'project', 'created_at']
    list_filter = ['action_type']
    ordering = ['-created_at']

admin.site.register(TaskAttachment)
