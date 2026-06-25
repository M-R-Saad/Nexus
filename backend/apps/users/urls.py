from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from .views import (
    RegisterView, MeView, PublicProfileView,
    SkillListView, UserSkillView, UserSkillDeleteView,
    AvatarUploadView, UserDashboardView
)

# Auth routes — mounted at /api/auth/
auth_urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='logout'),
]

# User routes — mounted at /api/users/
urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('me/avatar/', AvatarUploadView.as_view(), name='avatar-upload'),
    path('me/skills/', UserSkillView.as_view(), name='my-skills'),
    path('me/skills/<int:pk>/', UserSkillDeleteView.as_view(), name='delete-skill'),
    path('me/dashboard/', UserDashboardView.as_view(), name='dashboard'),
    path('skills/', SkillListView.as_view(), name='skills-list'),
    path('<str:username>/', PublicProfileView.as_view(), name='public-profile'),
]
