from django.urls import path
from .views import ApplicationDecisionView, MyApplicationsView

urlpatterns = [
    path('mine/', MyApplicationsView.as_view(), name='my-applications'),
    path('<uuid:pk>/decide/', ApplicationDecisionView.as_view(), name='application-decision'),
]
