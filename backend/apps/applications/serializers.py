from rest_framework import serializers
from .models import Application
from apps.users.serializers import UserPublicSerializer
from apps.projects.serializers import ProjectListSerializer, ProjectRoleSerializer


class ApplicationSerializer(serializers.ModelSerializer):
    applicant = UserPublicSerializer(read_only=True)
    project = ProjectListSerializer(read_only=True)
    role = ProjectRoleSerializer(read_only=True)
    project_id = serializers.UUIDField(write_only=True)
    role_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'project', 'project_id', 'applicant',
            'role', 'role_id', 'pitch', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'applicant', 'status', 'created_at']
