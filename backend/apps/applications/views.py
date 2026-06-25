from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Application
from .serializers import ApplicationSerializer
from apps.projects.models import Project, ProjectRole, ProjectMember


class ApplyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        if project.owner == request.user:
            return Response({'error': 'You cannot apply to your own project.'}, status=status.HTTP_400_BAD_REQUEST)

        if ProjectMember.objects.filter(project=project, user=request.user).exists():
            return Response({'error': 'You are already a member of this project.'}, status=status.HTTP_400_BAD_REQUEST)

        role_id = request.data.get('role_id')
        role = get_object_or_404(ProjectRole, id=role_id, project=project)

        if Application.objects.filter(project=project, applicant=request.user, role=role).exists():
            return Response({'error': 'You have already applied for this role.'}, status=status.HTTP_400_BAD_REQUEST)

        application = Application.objects.create(
            project=project,
            applicant=request.user,
            role=role,
            pitch=request.data.get('pitch', '')
        )

        # --- Phase 8: notify project owner of new application ---
        from apps.notifications.utils import notify
        notify(
            recipient=project.owner,
            type='new_applicant',
            title=f"{request.user.username} applied to join {project.title}",
            body=f"They applied for the role: {role.title}",
            link=f"/projects/{project.id}",
            meta={
                'project_id': str(project.id),
                'application_id': str(application.id),
                'applicant_username': request.user.username,
            }
        )

        return Response(ApplicationSerializer(application).data, status=status.HTTP_201_CREATED)


class ProjectApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project = get_object_or_404(Project, pk=self.kwargs['pk'], owner=self.request.user)
        return Application.objects.filter(project=project).select_related('applicant', 'role')


class ApplicationDecisionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        application = get_object_or_404(Application, pk=pk, project__owner=request.user)
        decision = request.data.get('status')

        if decision not in ('Accepted', 'Rejected'):
            return Response({'error': 'Status must be Accepted or Rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        application.status = decision
        application.save()

        if decision == 'Accepted':
            ProjectMember.objects.get_or_create(
                project=application.project,
                user=application.applicant,
                defaults={'role': application.role}
            )
            application.role.is_filled = True
            application.role.save()

        # --- Phase 8: notify applicant of decision ---
        from apps.notifications.utils import notify
        notif_type = 'application_accepted' if decision == 'Accepted' else 'application_rejected'
        title = (
            f"You've been accepted to {application.project.title}!"
            if decision == 'Accepted'
            else f"Your application to {application.project.title} was not accepted"
        )
        body = (
            f"You're now a member as {application.role.title}. Head to the workspace!"
            if decision == 'Accepted'
            else f"The owner decided not to move forward with your application for {application.role.title}."
        )
        link = f"/workspace/{application.project.id}" if decision == 'Accepted' else f"/projects/{application.project.id}"

        notify(
            recipient=application.applicant,
            type=notif_type,
            title=title,
            body=body,
            link=link,
            meta={
                'project_id': str(application.project.id),
                'application_id': str(application.id),
            }
        )

        # Also send async email via Celery
        from core.tasks import send_application_decision_email
        send_application_decision_email.delay(str(application.id), decision)

        return Response(ApplicationSerializer(application).data)


class MyApplicationsView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user).select_related('project', 'role')
