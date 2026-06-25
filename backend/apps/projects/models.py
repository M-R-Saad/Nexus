import uuid
from django.db import models
from django.conf import settings


class Project(models.Model):
    STATUS_CHOICES = [
        ('Recruiting', 'Recruiting'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Archived', 'Archived'),
    ]
    DIFFICULTY_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_projects')
    title = models.CharField(max_length=150)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Recruiting')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='Intermediate')
    repo_url = models.URLField(max_length=255, blank=True, null=True)
    activity_score = models.IntegerField(default=0)
    tech_stack = models.ManyToManyField('users.Skill', through='ProjectTechStack', blank=True)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, through='ProjectMember', related_name='joined_projects', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['activity_score']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.title


class ProjectTechStack(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    skill = models.ForeignKey('users.Skill', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('project', 'skill')


class ProjectRole(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='roles')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_filled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.project.title} - {self.title}"


class ProjectMember(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.ForeignKey(ProjectRole, on_delete=models.SET_NULL, null=True, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'user')


class Bookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookmarks')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'project')
