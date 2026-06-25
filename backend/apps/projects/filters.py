import django_filters
from .models import Project


class ProjectFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name='status', lookup_expr='iexact')
    difficulty = django_filters.CharFilter(field_name='difficulty', lookup_expr='iexact')
    tech_stack = django_filters.NumberFilter(field_name='tech_stack__id')
    role = django_filters.CharFilter(field_name='roles__title', lookup_expr='icontains')

    class Meta:
        model = Project
        fields = ['status', 'difficulty', 'tech_stack', 'role']
