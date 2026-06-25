from django.contrib import admin
from .models import Project, ProjectRole, ProjectMember, ProjectTechStack, Bookmark

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'status', 'difficulty', 'activity_score', 'created_at']
    list_filter = ['status', 'difficulty']
    search_fields = ['title', 'owner__username']
    ordering = ['-created_at']

@admin.register(ProjectRole)
class ProjectRoleAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'is_filled']
    list_filter = ['is_filled']

@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'role', 'joined_at']

admin.site.register(ProjectTechStack)
admin.site.register(Bookmark)
