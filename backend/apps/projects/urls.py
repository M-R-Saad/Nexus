from django.urls import path
from .views import (
    ProjectListCreateView, ProjectDetailView, TrendingProjectsView,
    ProjectMembersView, BookmarkToggleView, MyBookmarksView,
)
from apps.applications.views import ApplyView, ProjectApplicationsView

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='projects-list'),
    path('trending/', TrendingProjectsView.as_view(), name='projects-trending'),
    path('bookmarks/', MyBookmarksView.as_view(), name='my-bookmarks'),
    path('<uuid:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('<uuid:pk>/members/', ProjectMembersView.as_view(), name='project-members'),
    path('<uuid:pk>/bookmark/', BookmarkToggleView.as_view(), name='bookmark-toggle'),
    # Application endpoints scoped to a project
    path('<uuid:pk>/apply/', ApplyView.as_view(), name='project-apply'),
    path('<uuid:pk>/applications/', ProjectApplicationsView.as_view(), name='project-applications'),
]
