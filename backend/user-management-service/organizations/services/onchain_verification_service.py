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
    def get_verifications_by_trx_hash(trx_hash):
        verification = OnchainVerificationRepository.get_verification_by_trx_hash(trx_hash)
        if not verification:
            raise Exception(f"OnchainVerification with transaction hash {trx_hash} not found")
        
        return verification
    
    @staticmethod
    def update_verification_status_by_trx_hash(trx_hash, status):
        # Validate trx_hash
        if not trx_hash or not trx_hash.startswith("0x") or len(trx_hash) != 66:
            raise Exception("Invalid transaction hash format")
         
        # Get current verification
        verification = OnchainVerificationRepository.get_verification_by_trx_hash(trx_hash)
        if not verification:
            raise Exception(f"OnchainVerification with transaction hash {trx_hash} not found")
        
        current_status = verification.onchain_status
        
        # Allow idempotent updates (same status)
        if current_status == status:
            return verification
        
        # Use utility function for validation
        OnchainVerificationService._validate_status_transition(current_status, status)

        # Update verification status
        updated_verification = OnchainVerificationRepository.update_verification_status_by_trx_hash(trx_hash, status)
        if not updated_verification:
            raise Exception("Failed to update verification status in database")
        
        return updated_verification
    
    @staticmethod
    def update_verification_onchain_id_by_trx_hash(trx_hash, onchain_id):
        # Validate trx_hash
        if not trx_hash or not trx_hash.startswith("0x") or len(trx_hash) != 66:
            raise Exception("Invalid transaction hash format")
        
        # Validate onchain_id
        if onchain_id is None:
            raise Exception("onchain_id is required")
        
        try:
            return OnchainVerificationRepository.update_verification_onchain_id_by_trx_hash(trx_hash, onchain_id)
        except Exception as e:
            raise Exception(f"Failed to update onchain_id: {str(e)}")
        
    @staticmethod
    def update_verification_status_by_onchain_id(onchain_id, status):
        # Validate onchain_id
        if onchain_id is None:
            raise Exception("onchain_id is required")

        # Get current verification
        verification = OnchainVerificationRepository.get_verification_by_onchain_id(onchain_id)
        if not verification:
            raise Exception(f"OnchainVerification with on-chain ID {onchain_id} not found")

        current_status = verification.onchain_status

        # Allow idempotent updates (same status)
        if current_status == status:
            return verification

        # Use utility function for validation
        OnchainVerificationService._validate_status_transition(current_status, status)

        # Update verification status
        try:
            updated_verification = OnchainVerificationRepository.update_verification_status_by_onchain_id(onchain_id, status)
        except Exception as e:
            print(f"Proposal on-chain ID issue found | Error: {str(e)}")
        
        print(f"Successfully updated proposal status into {status} of proposal id {onchain_id} (on-chain)")

        return updated_verification

    @staticmethod
    def add_onchain_id_to_verification(proposer_wallet, onchain_id):
        """Add an on-chain ID to the latest verification for a proposer wallet"""
        if not proposer_wallet:
            print(" [!] Missing proposer wallet")
            return
        if not onchain_id:
            print(" [!] Missing on-chain ID")
            return

        try:
            return OnchainVerificationRepository.add_verification_onchain_id(proposer_wallet, onchain_id)
        except Exception as e:
            print(f" [!] Failed to add on-chain ID to verification: {str(e)}")

    @staticmethod
    def get_verification_by_proposer_wallet(proposer_wallet):
        """
        Get the latest on-chain verification by proposer wallet address.
        Returns the most recent verification (by creation time) if multiple exist.
        """
        if not proposer_wallet:
            raise Exception("Proposer wallet is required")
        
        return OnchainVerificationRepository.get_latest_verification_by_proposer_wallet(proposer_wallet)
    
    @staticmethod
    def update_verification_onchain_id_by_proposer_wallet(proposer_wallet, onchain_id):
        """
        Update the onchain_id field for the latest verification by proposer wallet address.
        """
        if not proposer_wallet:
            raise Exception("Proposer wallet is required")
        if not onchain_id:
            raise Exception("On-chain ID is required")
        
        return OnchainVerificationRepository.update_verification_onchain_id_by_proposer_wallet(proposer_wallet, onchain_id)

    @staticmethod
    def handle_proposal_creation(proposer_wallet, onchain_id):
        """Handle new proposal creation"""
        if not proposer_wallet:
            print(" [!] Missing proposer wallet")
            return
        if not onchain_id:
            print(" [!] Missing on-chain ID")
            return
        
        org_id = OrganizationRepository.get_organization_id_by_admin_wallet(proposer_wallet)
        if not org_id:
            print("No organization found with wallet address:", proposer_wallet)
            return

        try:
            # Step 1: Add onchain_id to the latest verification by proposer_wallet
            with transaction.atomic():
                verification = OnchainVerificationService.add_onchain_id_to_verification(proposer_wallet, onchain_id)
                print(f" [*] Added onchain_id {onchain_id} to verification {verification.id}")
                
                # Step 2: Update the status to 'pending' using the onchain_id
                updated_verification = OnchainVerificationService.update_verification_status_by_onchain_id(onchain_id, 'pending')
                print(f" [*] Updated verification status to 'pending' for onchain_id {onchain_id}")

                print(f"Successfully updated proposal_onchain_id to ${onchain_id} for wallet address: ${proposer_wallet}")

                return updated_verification
        except Exception as e:
            print('Proposal on-chain ID or Wallet address issue found | Error:', str(e))

    # ===== UTILITY FUNCTIONS =====
    
    @staticmethod
    def _validate_status_transition(current_status, new_status):
        # Define valid statuses
        valid_statuses = ['register', 'pending', 'approved', 'cancelled']
        
        # Validate status values
        if new_status not in valid_statuses:
            raise Exception(f"Invalid status: {new_status}. Must be one of {valid_statuses}")
        
        if current_status not in valid_statuses:
            raise Exception(f"Invalid current status: {current_status}")
        
        # Define valid status transitions
        valid_transitions = {
            'register': ['pending', 'cancelled'],     # Can move to pending or cancelled
            'pending': ['approved', 'cancelled'],     # Can be approved or cancelled while pending
            'approved': [],                           # Final state - cannot change once approved
            'cancelled': [],                          # Final state - cannot change once cancelled
        }
        
        # Get allowed transitions for current status
        allowed_transitions = valid_transitions.get(current_status, [])
        
        # Check if transition is valid
        if new_status not in allowed_transitions:
            if current_status in ['approved', 'cancelled']:
                raise Exception(f"Cannot update status from '{current_status}' as it is a final state")
            else:
                raise Exception(
                    f"Invalid status transition from '{current_status}' to '{new_status}'. "
                    f"Allowed transitions: {allowed_transitions}"
                )