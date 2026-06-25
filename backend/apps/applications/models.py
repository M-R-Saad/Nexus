import uuid
from django.db import models
from django.conf import settings


class Application(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    role = models.ForeignKey('projects.ProjectRole', on_delete=models.CASCADE)
    pitch = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('project', 'applicant', 'role')
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['applicant', 'status']),
        ]

    def __str__(self):
        return f"{self.applicant.username} -> {self.project.title} ({self.status})"
