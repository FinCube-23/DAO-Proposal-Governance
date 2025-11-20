from django.db.models import Count, Q
from users.models import User
from organizations.models import Organization, OnchainVerification


class AnalyticsRepository:
    
    @staticmethod
    def get_user_counts():
        """
        Get user statistics including total, status breakdowns, and active count.
        Uses a single aggregated query for efficiency.
        """
        stats = User.objects.aggregate(
            total=Count('id'),
            pending=Count('id', filter=Q(status='pending')),
            approved=Count('id', filter=Q(status='approved')),
            rejected=Count('id', filter=Q(status='rejected')),
            banned=Count('id', filter=Q(status='banned')),
            active=Count('id', filter=Q(is_active=True)),
        )
        return stats
    
    @staticmethod
    def get_organization_counts():
        """
        Get organization statistics including total, status breakdowns, and active count.
        Uses a single aggregated query for efficiency.
        """
        stats = Organization.objects.aggregate(
            total=Count('id'),
            pending=Count('id', filter=Q(status='pending')),
            approved=Count('id', filter=Q(status='approved')),
            cancelled=Count('id', filter=Q(status='cancelled')),
            banned=Count('id', filter=Q(status='banned')),
            active=Count('id', filter=Q(is_active=True)),
        )
        return stats
    
    @staticmethod
    def get_onchain_verification_counts():
        """
        Get onchain verification statistics including total and status breakdowns.
        Uses a single aggregated query for efficiency.
        """
        stats = OnchainVerification.objects.aggregate(
            total=Count('id'),
            register=Count('id', filter=Q(onchain_status='register')),
            pending=Count('id', filter=Q(onchain_status='pending')),
            approved=Count('id', filter=Q(onchain_status='approved')),
            cancelled=Count('id', filter=Q(onchain_status='cancelled')),
        )
        return stats
    
    @staticmethod
    def get_all_stats():
        """
        Get all statistics in one method.
        Uses only 3 database queries (one per model) instead of 16.
        Returns a dictionary with users, organizations, and onchain_verifications counts.
        """
        return {
            'users': AnalyticsRepository.get_user_counts(),
            'organizations': AnalyticsRepository.get_organization_counts(),
            'onchain_verifications': AnalyticsRepository.get_onchain_verification_counts(),
        }