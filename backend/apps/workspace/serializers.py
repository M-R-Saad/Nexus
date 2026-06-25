from rest_framework import serializers
from .models import Task, TaskAttachment, ActivityFeed
from apps.users.serializers import UserPublicSerializer


class TaskAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskAttachment
        fields = ['id', 'file_url', 'file_name', 'file_size', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['uploaded_by', 'uploaded_at']


class TaskSerializer(serializers.ModelSerializer):
    created_by = UserPublicSerializer(read_only=True)
    assigned_to = UserPublicSerializer(read_only=True)
    assigned_to_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'created_by', 'assigned_to', 'assigned_to_id',
            'title', 'description', 'status', 'priority', 'deadline',
            'position', 'attachments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'project', 'created_by', 'created_at', 'updated_at']


class ActivityFeedSerializer(serializers.ModelSerializer):
    actor = UserPublicSerializer(read_only=True)

    class Meta:
        model = ActivityFeed
        fields = ['id', 'actor', 'action_type', 'description', 'meta', 'created_at']
