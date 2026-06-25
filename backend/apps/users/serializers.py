from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Skill, UserSkill

User = get_user_model()


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category']


class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), source='skill', write_only=True
    )

    class Meta:
        model = UserSkill
        fields = ['id', 'skill', 'skill_id', 'proficiency']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password']

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_username(self, value):
        if not value.isalnum() and '_' not in value:
            raise serializers.ValidationError('Username can only contain letters, numbers, and underscores.')
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    user_skills = UserSkillSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'bio', 'avatar_url',
            'github_url', 'portfolio_url', 'user_skills', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'created_at']

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value


class UserPublicSerializer(serializers.ModelSerializer):
    user_skills = UserSkillSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'bio', 'avatar_url',
            'github_url', 'portfolio_url', 'user_skills', 'created_at'
        ]


class UserMinimalSerializer(serializers.ModelSerializer):
    """Lightweight serializer used inside nested objects."""
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar_url']
