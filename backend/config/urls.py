from django.contrib import admin
from django.urls import path, include
from apps.users.urls import auth_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include((auth_urlpatterns, 'auth'))),
    path('api/users/', include('apps.users.urls')),
    path('api/projects/', include('apps.projects.urls')),
    path('api/applications/', include('apps.applications.urls')),
    path('api/workspace/', include('apps.workspace.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]
