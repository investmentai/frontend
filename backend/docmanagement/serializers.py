from rest_framework import serializers
from .models import UserReport, ReportSection


class ReportSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportSection
        fields = "__all__"


class ReportVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserReport
        fields = ["id", "revision_number", "modified_date", "ai_generated"]


class UserReportSerializer(serializers.ModelSerializer):
    sections = ReportSectionSerializer(many=True, read_only=True)

    class Meta:
        model = UserReport
        fields = "__all__"
