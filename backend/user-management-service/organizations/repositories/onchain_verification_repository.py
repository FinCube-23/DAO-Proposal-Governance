# organizations/repositories/onchain_verification_repository.py
from django.core.paginator import Paginator, EmptyPage
from organizations.models import OnchainVerification, Organization

class OnchainVerificationRepository:
    
    @classmethod
    def create_onchain_verification(cls, trx_hash, context, proposer_wallet, organization_id):
        """
        Create a new on-chain verification record.
        """
        organization = Organization.objects.get(id=organization_id)
        
        return OnchainVerification.objects.create(
            trx_hash=trx_hash,
            context=context,
            proposer_wallet=proposer_wallet,
            organization=organization
        )
    
    @classmethod
    def get_verifications_by_organization(cls, organization_id, page, limit):
        """
        Get all on-chain verifications for a specific organization with pagination.
        """
        queryset = OnchainVerification.objects.filter(
            organization_id=organization_id
        ).order_by('-created_at')
        
        paginator = Paginator(queryset, limit)
        
        try:
            return (
                list(paginator.page(page).object_list),
                {'page': page, 'limit': limit, 'total': paginator.count}
            )
        except EmptyPage:
            raise Exception("Page not found")
    
    @classmethod
    def get_verification_by_id(cls, verification_id):
        """
        Get a specific on-chain verification by ID.
        """
        try:
            return OnchainVerification.objects.get(pk=verification_id)
        except OnchainVerification.DoesNotExist:
            return None
    
    @classmethod
    def get_verification_by_trx_hash(cls, trx_hash):
        """
        Get on-chain verification by transaction hash.
        """
        try:
            return OnchainVerification.objects.get(trx_hash=trx_hash)
        except OnchainVerification.DoesNotExist:
            return None
        
    @classmethod
    def update_verification_status_by_trx_hash(cls, trx_hash, status):
        """
        Update the status of an on-chain verification.
        """
        try:
            verification = cls.get_verification_by_trx_hash(trx_hash)
            if not verification:
                raise Exception(f"OnchainVerification with transaction hash {trx_hash} not found")
                
            verification.onchain_status = status
            verification.save()
            return verification
            
        except Exception as e:
            raise Exception(f"Failed to update on-chain verification status: {str(e)}")
        
    @classmethod
    def update_verification_onchain_id_by_trx_hash(cls, trx_hash, onchain_id):
        """
        Update the status of an on-chain verification.
        """
        try:
            verification = cls.get_verification_by_trx_hash(trx_hash)
            if not verification:
                raise Exception(f"OnchainVerification with transaction hash {trx_hash} not found")
                
            verification.onchain_id = onchain_id
            verification.save()
            return verification
            
        except Exception as e:
            raise Exception(f"Failed to update verification onchain_id: {str(e)}")