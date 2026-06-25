from rest_framework import serializers
from .models import Project, ProjectRole, ProjectMember, ProjectTechStack, Bookmark
from apps.users.serializers import UserPublicSerializer, SkillSerializer


class ProjectRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectRole
        fields = ['id', 'title', 'description', 'is_filled']


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    role = ProjectRoleSerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'role', 'joined_at']


class ProjectSerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(read_only=True)
    roles = ProjectRoleSerializer(many=True, read_only=True)
    tech_stack = SkillSerializer(many=True, read_only=True)
    members = ProjectMemberSerializer(source='project_members', many=True, read_only=True)

    # write-only helpers
    tech_stack_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    roles_input = serializers.ListField(
        child=serializers.DictField(), write_only=True, required=False
    )

    member_count = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'owner', 'title', 'description', 'status', 'difficulty',
            'repo_url', 'activity_score', 'tech_stack', 'tech_stack_ids',
            'roles', 'roles_input', 'members', 'member_count', 'is_bookmarked',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'activity_score', 'created_at', 'updated_at']

    def get_member_count(self, obj):
        return obj.project_members.count()

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarked_by.filter(user=request.user).exists()
        return False

    def create(self, validated_data):
        tech_stack_ids = validated_data.pop('tech_stack_ids', [])
        roles_input = validated_data.pop('roles_input', [])
        project = Project.objects.create(**validated_data)

        if tech_stack_ids:
            from apps.users.models import Skill
            for skill_id in tech_stack_ids:
                try:
                    ProjectTechStack.objects.create(
                        project=project, skill=Skill.objects.get(id=skill_id)
                    )
                except Skill.DoesNotExist:
                    pass

        for role_data in roles_input:
            title = role_data.get('title', '').strip()
            if title:
                ProjectRole.objects.create(
                    project=project,
                    title=title,
                    description=role_data.get('description', ''),
                )

        return project

    def update(self, instance, validated_data):
        # Remove write-only helpers before updating
        validated_data.pop('tech_stack_ids', None)
        validated_data.pop('roles_input', None)
        return super().update(instance, validated_data)


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list/card views."""
    owner = UserPublicSerializer(read_only=True)
    tech_stack = SkillSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    open_roles_count = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'owner', 'title', 'status', 'difficulty',
            'tech_stack', 'member_count', 'open_roles_count',
            'is_bookmarked', 'activity_score', 'created_at',
        ]

    def get_member_count(self, obj):
        return obj.project_members.count()

    def get_open_roles_count(self, obj):
        return obj.roles.filter(is_filled=False).count()

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarked_by.filter(user=request.user).exists()
        return False
