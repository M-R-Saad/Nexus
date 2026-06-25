from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import Project, ProjectMember, Bookmark
from .serializers import ProjectSerializer, ProjectListSerializer, ProjectMemberSerializer
from .filters import ProjectFilter


class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.select_related('owner').prefetch_related(
        'tech_stack', 'roles', 'project_members', 'bookmarked_by'
    )
    filterset_class = ProjectFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'activity_score']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProjectListSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.select_related('owner').prefetch_related(
        'tech_stack', 'roles', 'project_members__user', 'project_members__role', 'bookmarked_by'
    )
    serializer_class = ProjectSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ('PUT', 'PATCH', 'DELETE') and obj.owner != request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only the project owner can edit this project.')


class TrendingProjectsView(generics.ListAPIView):
    serializer_class = ProjectListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        week_ago = timezone.now() - timedelta(days=7)
        return Project.objects.filter(
            created_at__gte=week_ago
        ).select_related('owner').prefetch_related(
            'tech_stack', 'roles', 'project_members', 'bookmarked_by'
        ).order_by('-activity_score')[:10]


class ProjectMembersView(generics.ListAPIView):
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProjectMember.objects.filter(
            project_id=self.kwargs['pk']
        ).select_related('user', 'role')


class BookmarkToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            project = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        bookmark, created = Bookmark.objects.get_or_create(user=request.user, project=project)
        if not created:
            bookmark.delete()
            return Response({'bookmarked': False})
        return Response({'bookmarked': True}, status=status.HTTP_201_CREATED)


class MyBookmarksView(generics.ListAPIView):
    serializer_class = ProjectListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(
            bookmarked_by__user=self.request.user
        ).select_related('owner').prefetch_related('tech_stack', 'roles', 'project_members')
