from analytics.repositories.analytics_repository import AnalyticsRepository

class AnalyticsService:
    
    @staticmethod
    def get_all_stats():
        """
        Get all statistics using the AnalyticsRepository.
        """
        return AnalyticsRepository.get_all_stats()