from rest_framework import serializers
from .models import Message
from apps.users.serializers import UserPublicSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserPublicSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'project', 'sender', 'content', 'created_at']
        read_only_fields = ['id', 'project', 'sender', 'created_at']
