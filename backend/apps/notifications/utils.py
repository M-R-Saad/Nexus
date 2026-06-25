from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification


def notify(recipient, type, title, body=None, link=None, meta=None):
    """
    Create a DB notification and push it live via WebSocket.
    Safe to call from anywhere — never raises even if push fails.
    """
    notif = Notification.objects.create(
        recipient=recipient,
        type=type,
        title=title,
        body=body,
        link=link,
        meta=meta,
        is_read=False,
    )

    channel_layer = get_channel_layer()
    if channel_layer:
        try:
            async_to_sync(channel_layer.group_send)(
                f'notifications_{recipient.id}',
                {
                    'type': 'send_notification',
                    'notification': {
                        'type': 'notification',
                        'id': str(notif.id),
                        'notif_type': notif.type,
                        'title': notif.title,
                        'body': notif.body,
                        'link': notif.link,
                        'is_read': False,
                        'meta': notif.meta,
                        'created_at': notif.created_at.isoformat(),
                    }
                }
            )
        except Exception:
            pass

    return notif
