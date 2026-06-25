from django.urls import path
from rest_framework import generics, permissions
from .models import Message
from .serializers import MessageSerializer


class MessageHistoryView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(
            project_id=self.kwargs['project_id']
        ).select_related('sender').order_by('created_at')


urlpatterns = [
    path('projects/<uuid:project_id>/messages/', MessageHistoryView.as_view(), name='message-history'),
]
