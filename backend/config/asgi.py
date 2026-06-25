import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

# Initialize Django ASGI app early to populate app registry
django_asgi_app = get_asgi_application()

# Import after Django setup to avoid AppRegistryNotReady errors
from channels.routing import ProtocolTypeRouter, URLRouter
from apps.chat.middleware import JWTAuthMiddleware
from apps.chat.routing import websocket_urlpatterns as chat_ws
from apps.notifications.routing import websocket_urlpatterns as notification_ws

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JWTAuthMiddleware(
        URLRouter(chat_ws + notification_ws)
    ),
})

