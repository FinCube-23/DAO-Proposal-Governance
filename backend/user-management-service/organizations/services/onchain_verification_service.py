# organizations/services/onchain_verification_service.py
from organizations.repositories.onchain_verification_repository import OnchainVerificationRepository
from organizations.repositories.organization_repository import OrganizationRepository

class OnchainVerificationService:
    
    @staticmethod
    def create_onchain_verification(verification_data):
        """
        Create a new on-chain verification with validation.
        """
        organization_id = verification_data['organization_id']
        trx_hash = verification_data['trx_hash']
        context = verification_data['context']
        proposer_wallet = verification_data['proposer_wallet']
        
        # Validate organization exists
        organization = OrganizationRepository.get_organization_by_id(organization_id)
        if not organization:
            raise Exception("Organization does not exist")
        
        # Check if transaction hash already exists
        existing_verification = OnchainVerificationRepository.get_verification_by_trx_hash(trx_hash)
        if existing_verification:
            raise Exception("Transaction hash already exists")
        
        # Create on-chain verification
        return OnchainVerificationRepository.create_onchain_verification(
            trx_hash=trx_hash,
            context=context,
            proposer_wallet=proposer_wallet,
            organization_id=organization_id
        )
    
    @staticmethod
    def get_verifications_by_organization(organization_id, query_params):
        """
        Get all on-chain verifications for a specific organization with pagination.
        """
        # Validate and parse parameters
        page = int(query_params.get('page', 1))
        limit = int(query_params.get('limit', 10))
        
        if page < 1 or limit < 1:
            raise Exception("Page and limit must be positive numbers")
        
        # Validate organization exists
        organization = OrganizationRepository.get_organization_by_id(organization_id)
        if not organization:
            raise Exception("Organization does not exist")
        
        # Delegate to repository
        return OnchainVerificationRepository.get_verifications_by_organization(
            organization_id, page, limit
        )