from django.urls import path
from .views import TaskListCreateView, TaskDetailView, ActivityFeedView, TaskAttachmentUploadView

urlpatterns = [
    path('projects/<uuid:project_pk>/tasks/', TaskListCreateView.as_view(), name='task-list'),
    path('tasks/<uuid:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<uuid:pk>/attachments/', TaskAttachmentUploadView.as_view(), name='task-attachments'),
    path('projects/<uuid:project_pk>/activity/', ActivityFeedView.as_view(), name='activity-feed'),
]
