from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Task, TaskAttachment, ActivityFeed
from .serializers import TaskSerializer, TaskAttachmentSerializer, ActivityFeedSerializer
from apps.projects.models import Project, ProjectMember


def is_project_member(user, project):
    return ProjectMember.objects.filter(project=project, user=user).exists() or project.owner == user


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        if not is_project_member(self.request.user, project):
            return Task.objects.none()
        return Task.objects.filter(project=project).select_related('created_by', 'assigned_to')

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        if not is_project_member(self.request.user, project):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You are not a member of this project.")

        assigned_to_id = serializer.validated_data.pop('assigned_to_id', None)
        kwargs = {}
        if assigned_to_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                kwargs['assigned_to'] = User.objects.get(id=assigned_to_id)
            except User.DoesNotExist:
                pass

        task = serializer.save(project=project, created_by=self.request.user, **kwargs)

        ActivityFeed.objects.create(
            project=project,
            actor=self.request.user,
            action_type='task_created',
            description=f"{self.request.user.username} created task '{task.title}'"
        )

        # --- Phase 8: notify assignee ---
        if task.assigned_to and task.assigned_to != self.request.user:
            from apps.notifications.utils import notify
            notify(
                recipient=task.assigned_to,
                type='task_assigned',
                title=f"You were assigned a task in {project.title}",
                body=f"Task: {task.title}",
                link=f"/workspace/{project.id}/kanban",
                meta={'task_id': str(task.id), 'project_id': str(project.id)}
            )


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.select_related('created_by', 'assigned_to', 'project')

    def perform_update(self, serializer):
        task = self.get_object()
        old_status = task.status
        old_assigned = task.assigned_to

        assigned_to_id = serializer.validated_data.pop('assigned_to_id', None)
        kwargs = {}
        if assigned_to_id is not None:
            if assigned_to_id:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                try:
                    kwargs['assigned_to'] = User.objects.get(id=assigned_to_id)
                except User.DoesNotExist:
                    pass
            else:
                kwargs['assigned_to'] = None

        updated_task = serializer.save(**kwargs)

        # Log status change
        if old_status != updated_task.status:
            action_type = 'task_completed' if updated_task.status == 'Done' else 'task_moved'
            ActivityFeed.objects.create(
                project=updated_task.project,
                actor=self.request.user,
                action_type=action_type,
                description=f"{self.request.user.username} moved '{updated_task.title}' to {updated_task.status}",
                meta={'old_status': old_status, 'new_status': updated_task.status}
            )

        # Log + notify on new assignment
        new_assigned = updated_task.assigned_to
        if old_assigned != new_assigned and new_assigned is not None:
            ActivityFeed.objects.create(
                project=updated_task.project,
                actor=self.request.user,
                action_type='task_assigned',
                description=f"{self.request.user.username} assigned '{updated_task.title}' to {new_assigned.username}",
                meta={'assigned_to': str(new_assigned.id)}
            )

            # --- Phase 8: notify assignee ---
            if new_assigned != self.request.user:
                from apps.notifications.utils import notify
                notify(
                    recipient=new_assigned,
                    type='task_assigned',
                    title=f"You were assigned a task in {updated_task.project.title}",
                    body=f"Task: {updated_task.title}",
                    link=f"/workspace/{updated_task.project.id}/kanban",
                    meta={
                        'task_id': str(updated_task.id),
                        'project_id': str(updated_task.project.id)
                    }
                )


class TaskAttachmentUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        task = get_object_or_404(Task, pk=pk)
        if not is_project_member(request.user, task.project):
            return Response({'error': 'Not a project member.'}, status=status.HTTP_403_FORBIDDEN)

        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        if file.size > 10 * 1024 * 1024:
            return Response({'error': 'File must be under 10MB.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from core.cloudinary_utils import upload_file
            result = upload_file(file, folder='nexus/attachments')
            attachment = TaskAttachment.objects.create(
                task=task,
                uploaded_by=request.user,
                file_url=result['url'],
                file_name=file.name,
                file_size=result.get('file_size') or file.size,
            )
            ActivityFeed.objects.create(
                project=task.project,
                actor=request.user,
                action_type='file_uploaded',
                description=f"{request.user.username} uploaded '{file.name}' to '{task.title}'"
            )
            return Response(TaskAttachmentSerializer(attachment).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ActivityFeedView(generics.ListAPIView):
    serializer_class = ActivityFeedSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        if not is_project_member(self.request.user, project):
            return ActivityFeed.objects.none()
        return ActivityFeed.objects.filter(project=project).select_related('actor')
