from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from .models import Skill, UserSkill
from .serializers import (
    RegisterSerializer, UserProfileSerializer, UserPublicSerializer,
    SkillSerializer, UserSkillSerializer, ChangePasswordSerializer
)
from apps.projects.models import Project, ProjectMember

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True  # always allow partial updates
        return super().update(request, *args, **kwargs)


class AvatarUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('avatar')
        if not file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        allowed_types = ['image/jpeg', 'image/png', 'image/webp']
        if file.content_type not in allowed_types:
            return Response({'error': 'Only JPEG, PNG, and WebP images are allowed.'}, status=status.HTTP_400_BAD_REQUEST)

        if file.size > 5 * 1024 * 1024:  # 5MB limit
            return Response({'error': 'Image must be under 5MB.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from core.cloudinary_utils import upload_file
            result = upload_file(file, folder='nexus/avatars')
            request.user.avatar_url = result['url']
            request.user.save()
            return Response({'avatar_url': result['url']})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password updated successfully.'})


class PublicProfileView(generics.RetrieveAPIView):
    serializer_class = UserPublicSerializer
    queryset = User.objects.all()
    lookup_field = 'username'
    permission_classes = [permissions.AllowAny]


class SkillListView(generics.ListAPIView):
    serializer_class = SkillSerializer
    queryset = Skill.objects.all().order_by('category', 'name')
    permission_classes = [permissions.AllowAny]


class UserSkillView(generics.ListCreateAPIView):
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user).select_related('skill')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserSkillDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user)


class UserDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        owned_projects = Project.objects.filter(owner=user).values(
            'id', 'title', 'status', 'activity_score', 'created_at'
        ).order_by('-created_at')

        joined = ProjectMember.objects.filter(user=user).exclude(
            project__owner=user
        ).select_related('project').order_by('-joined_at')

        joined_projects = [
            {
                'id': str(m.project.id),
                'title': m.project.title,
                'status': m.project.status,
                'joined_at': m.joined_at,
            }
            for m in joined
        ]

        from apps.applications.models import Application
        my_applications = Application.objects.filter(
            applicant=user
        ).select_related('project', 'role').order_by('-created_at')[:10]

        applications = [
            {
                'id': str(a.id),
                'project_id': str(a.project.id),
                'project_title': a.project.title,
                'role': a.role.title,
                'status': a.status,
                'created_at': a.created_at,
            }
            for a in my_applications
        ]

        from apps.projects.models import Bookmark
        bookmarked = Bookmark.objects.filter(user=user).select_related(
            'project'
        ).order_by('-created_at')[:10]

        bookmarked_projects = [
            {
                'id': str(b.project.id),
                'title': b.project.title,
                'status': b.project.status,
                'created_at': b.created_at,
            }
            for b in bookmarked
        ]

        return Response({
            'owned_projects': list(owned_projects),
            'joined_projects': joined_projects,
            'recent_applications': applications,
            'bookmarked_projects': bookmarked_projects,
            'stats': {
                'owned_count': owned_projects.count(),
                'joined_count': len(joined_projects),
                'pending_applications': Application.objects.filter(applicant=user, status='Pending').count(),
                'bookmarks_count': Bookmark.objects.filter(user=user).count(),
            }
        })
