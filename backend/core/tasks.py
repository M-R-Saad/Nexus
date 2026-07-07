from celery import shared_task
from django.utils import timezone
from datetime import timedelta


@shared_task
def increment_activity_score(project_id, amount=1):
    """
    Atomically bump a project's activity_score.
    Called async on significant actions: task CRUD, messages, member joins, file uploads.
    """
    from apps.projects.models import Project
    from django.db.models import F

    Project.objects.filter(id=project_id).update(
        activity_score=F('activity_score') + amount
    )



@shared_task
def send_deadline_reminders():
    """
    Runs daily via Celery Beat.
    Notifies all task assignees whose deadline is tomorrow.
    """
    from apps.workspace.models import Task
    from apps.notifications.utils import notify

    tomorrow = timezone.now().date() + timedelta(days=1)
    tasks = Task.objects.filter(
        deadline=tomorrow,
        assigned_to__isnull=False,
        status__in=['Todo', 'In Progress', 'Review']  # skip already-done tasks
    ).select_related('assigned_to', 'project')

    count = 0
    for task in tasks:
        notify(
            recipient=task.assigned_to,
            type='deadline_approaching',
            title=f"Task due tomorrow: {task.title}",
            body=f"Don't forget — '{task.title}' in {task.project.title} is due tomorrow.",
            link=f"/workspace/{task.project.id}/kanban",
            meta={'task_id': str(task.id), 'project_id': str(task.project.id)}
        )
        count += 1

    return f"Sent {count} deadline reminders"


@shared_task
def send_application_decision_email(application_id, decision):
    """
    Sends email to applicant when their application is accepted or rejected.
    Called asynchronously from ApplicationDecisionView.
    """
    from apps.applications.models import Application
    from django.core.mail import send_mail
    from django.conf import settings

    try:
        application = Application.objects.select_related(
            'applicant', 'project', 'role'
        ).get(id=application_id)

        subject = (
            f"You're in! Welcome to {application.project.title}"
            if decision == 'Accepted'
            else f"Update on your application to {application.project.title}"
        )
        message = (
            f"Hi {application.applicant.username},\n\n"
            f"Your application for the role '{application.role.title}' "
            f"in '{application.project.title}' has been {decision.lower()}.\n\n"
            + (
                "Head to Nexus to access the project workspace and start collaborating!\n\n"
                if decision == 'Accepted'
                else "Keep exploring other projects on Nexus — the right team is out there.\n\n"
            )
            + "The Nexus Team"
        )

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [application.applicant.email],
            fail_silently=True
        )
    except Application.DoesNotExist:
        pass
