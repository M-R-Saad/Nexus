from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

CORS_ALLOW_ALL_ORIGINS = True

# Use console email in dev
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
