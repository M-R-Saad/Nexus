import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.room_group_name = f'chat_{self.project_id}'
        self.presence_group = f'presence_{self.project_id}'

        # Reject unauthenticated connections
        if isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # Verify user is a project member
        is_member = await self.check_membership()
        if not is_member:
            await self.close(code=4003)
            return

        # Join chat room
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        # Join presence group and announce arrival
        await self.channel_layer.group_add(self.presence_group, self.channel_name)
        await self.accept()

        # Broadcast that this user came online
        await self.channel_layer.group_send(
            self.presence_group,
            {
                'type': 'presence_update',
                'event': 'join',
                'user': {
                    'id': str(self.user.id),
                    'username': self.user.username,
                    'avatar_url': self.user.avatar_url,
                }
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        if hasattr(self, 'presence_group'):
            # Broadcast that user went offline
            await self.channel_layer.group_send(
                self.presence_group,
                {
                    'type': 'presence_update',
                    'event': 'leave',
                    'user': {
                        'id': str(self.user.id),
                        'username': self.user.username,
                        'avatar_url': self.user.avatar_url,
                    }
                }
            )
            await self.channel_layer.group_discard(self.presence_group, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        msg_type = data.get('type', 'message')

        if msg_type == 'message':
            content = data.get('content', '').strip()
            if not content:
                return
            if len(content) > 2000:
                await self.send(text_data=json.dumps({'error': 'Message too long (max 2000 chars).'}))
                return

            message = await self.save_message(content)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': str(message.id),
                        'content': message.content,
                        'sender': {
                            'id': str(self.user.id),
                            'username': self.user.username,
                            'avatar_url': self.user.avatar_url,
                        },
                        'created_at': message.created_at.isoformat(),
                    }
                }
            )

        elif msg_type == 'typing':
            # Broadcast typing indicator to others (not back to sender)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user_id': str(self.user.id),
                    'username': self.user.username,
                    'is_typing': data.get('is_typing', False),
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            **event['message']
        }))

    async def typing_indicator(self, event):
        # Don't send typing indicator back to the user who is typing
        if event['user_id'] != str(self.user.id):
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing'],
            }))

    async def presence_update(self, event):
        # Don't send your own presence back to yourself
        if event['user']['id'] != str(self.user.id):
            await self.send(text_data=json.dumps({
                'type': 'presence',
                'event': event['event'],
                'user': event['user'],
            }))

    @database_sync_to_async
    def check_membership(self):
        from apps.projects.models import Project, ProjectMember
        try:
            project = Project.objects.get(id=self.project_id)
            return (
                project.owner == self.user or
                ProjectMember.objects.filter(project=project, user=self.user).exists()
            )
        except Project.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        from .models import Message
        return Message.objects.create(
            project_id=self.project_id,
            sender=self.user,
            content=content
        )
