# organizations/services/onchain_verification_service.py
from organizations.repositories.onchain_verification_repository import OnchainVerificationRepository
from organizations.repositories.organization_repository import OrganizationRepository
from django.db import transaction

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
    
    @staticmethod
    def update_verification_status_by_trx_hash(trx_hash, status):

        # Validate trx_hash
        if trx_hash.startswith("0x") and len(trx_hash) == 66:
            pass
        else:
            raise Exception("Invalid transaction hash format")

        # Define valid status transitions
        valid_transitions = {
            'register': ['pending', 'cancelled'],  # Can move to pending or cancelled
            'pending': ['approved', 'cancelled'],  # Can be approved or cancelled while pending
            'approved': [],  # Final state - cannot change once approved
            'cancelled': [],  # Final state - cannot change once cancelled
        }
         
        # Get current verification
        verification = OnchainVerificationRepository.get_verification_by_trx_hash(trx_hash)
        if not verification:
            raise Exception(f"OnchainVerification with transaction hash {trx_hash} not found")
        
        current_status = verification.onchain_status
        
        # Allow idempotent updates (same status)
        if current_status == status:
            return verification
        
        # Validate status transition
        allowed_statuses = valid_transitions.get(current_status, [])
        if status not in allowed_statuses:
            if current_status in ['approved', 'cancelled']:
                raise Exception(f"Cannot update status from '{current_status}' as it is a final state")
            else:
                raise Exception(
                    f"Invalid status transition from '{current_status}' to '{status}'. "
                    f"Allowed transitions: {allowed_statuses}"
                )

        # Update verification status
        updated_verification = OnchainVerificationRepository.update_verification_status_by_trx_hash(trx_hash, status)
        if not updated_verification:
            raise Exception("Failed to update verification status in database")
        
        return updated_verification
    
    @staticmethod
    def update_verification_onchain_id_by_trx_hash(trx_hash, onchain_id):
        # Validate trx_hash
        if trx_hash.startswith("0x") and len(trx_hash) == 66:
            pass
        else:
            raise Exception("Invalid transaction hash format")
        
        # Validate onchain_id
        if onchain_id is None:
            raise Exception("onchain_id is required")
        
        try:
            return OnchainVerificationRepository.update_verification_onchain_id_by_trx_hash(trx_hash, onchain_id)
        except Exception as e:
            raise Exception(f"Failed to update onchain_id: {str(e)}")
        
    @staticmethod
    def handle_proposal_creation(trx_hash, onchain_id):
        """Handle new proposal creation"""
        if not trx_hash:
            print(" [!] Missing transaction hash")
            return
        if not onchain_id:
            print(" [!] Missing on-chain ID")
            return

        try:
            with transaction.atomic():
                OnchainVerificationService.update_verification_status_by_trx_hash(trx_hash, 'pending')
                OnchainVerificationService.update_verification_onchain_id_by_trx_hash(trx_hash, onchain_id)
        except Exception as e:
            print(f" [✘] Failed to create on-chain verification: {str(e)}")