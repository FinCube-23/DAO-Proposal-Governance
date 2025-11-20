from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
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
    def get_all_verifications(cls, page, limit, filters=None, search=None, sort_by=None, order='desc'):
        """
        Get all on-chain verifications with filtering, search, and sorting.
        """
        filters = filters or {}
        queryset = OnchainVerification.objects.select_related('organization').filter(**filters)
        
        # Apply search across multiple fields (matching OnchainVerificationAdmin search_fields)
        if search:
            search_query = Q(organization__name__icontains=search) | \
                          Q(trx_hash__icontains=search) | \
                          Q(proposer_wallet__icontains=search) | \
                          Q(onchain_id__icontains=search)
            queryset = queryset.filter(search_query)
        
        # Apply sorting
        if sort_by:
            # Validate sort_by field to prevent injection
            allowed_sort_fields = [
                'id', 'trx_hash', 'onchain_id', 'onchain_status',
                'proposer_wallet', 'created_at', 'updated_at'
            ]
            if sort_by in allowed_sort_fields:
                order_prefix = '-' if order == 'desc' else ''
                queryset = queryset.order_by(f'{order_prefix}{sort_by}')
            else:
                queryset = queryset.order_by('-created_at')
        else:
            queryset = queryset.order_by('-created_at')
        
        paginator = Paginator(queryset, limit)
        
        try:
            page_obj = paginator.page(page)
            return (
                list(page_obj.object_list),
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
        
    @classmethod
    def get_verification_by_onchain_id(cls, onchain_id):
        """
        Get on-chain verification by on-chain ID.
        """
        try:
            return OnchainVerification.objects.get(onchain_id=onchain_id)
        except OnchainVerification.DoesNotExist:
            return None

    @classmethod
    def update_verification_status_by_onchain_id(cls, onchain_id, status):
        """
        Update the status of an on-chain verification.
        """
        try:
            verification = cls.get_verification_by_onchain_id(onchain_id)
            if not verification:
                raise Exception(f"OnchainVerification with on-chain ID {onchain_id} not found")

            verification.onchain_status = status
            verification.save()
            return verification

        except Exception as e:
            raise Exception(f"Failed to update on-chain verification status: {str(e)}")
        
    @classmethod
    def get_registered_verification_by_proposer_wallet(cls, proposer_wallet):
        """
        Get the latest on-chain verification by proposer wallet address where onchain_status is "register".
        Returns the most recent verification (by creation time) if multiple exist.
        """
        try:
            return OnchainVerification.objects.filter(
                proposer_wallet=proposer_wallet,
                onchain_status="register"
            ).order_by('-created_at').first()
        except Exception:
            return None
    
    @classmethod
    def get_latest_verification_by_proposer_wallet(cls, proposer_wallet):
        """
        Get the latest on-chain verification by proposer wallet address.
        Returns the most recent verification (by creation time) if multiple exist.
        """
        try:
            # First try exact match
            verification = OnchainVerification.objects.filter(
                proposer_wallet=proposer_wallet
            ).order_by('-created_at').first()
            
            if verification:
                return verification
            
            # If no exact match, try case-insensitive search
            verification = OnchainVerification.objects.filter(
                proposer_wallet__iexact=proposer_wallet
            ).order_by('-created_at').first()
            
            if verification:
                print(f" [⚠️] Found wallet with case-insensitive match: '{verification.proposer_wallet}'")
                return verification
            
            # If still no match, try with different case formats
            wallet_variations = [
                proposer_wallet.lower(),
                proposer_wallet.upper(),
                proposer_wallet.capitalize(),
                proposer_wallet.replace('0x', ''),  # Without 0x prefix
                f"0x{proposer_wallet}" if not proposer_wallet.startswith('0x') else proposer_wallet
            ]
            
            for variation in wallet_variations:
                if variation != proposer_wallet:  # Skip the original
                    verification = OnchainVerification.objects.filter(
                        proposer_wallet=variation
                    ).order_by('-created_at').first()
                    
                    if verification:
                        print(f" [⚠️] Found wallet with variation '{variation}': '{verification.proposer_wallet}'")
                        return verification
            
            return None
        except Exception:
            return None
    
    @classmethod
    def update_verification_onchain_id_by_proposer_wallet(cls, proposer_wallet, onchain_id):
        """
        Update the onchain_id field for the latest on-chain verification by proposer wallet address.
        """
        try:
            verification = cls.get_latest_verification_by_proposer_wallet(proposer_wallet)
            if not verification:
                raise Exception(f"OnchainVerification with proposer wallet {proposer_wallet} not found")

            verification.onchain_id = onchain_id
            verification.save(update_fields=['onchain_id'])
            return verification

        except Exception as e:
            raise Exception(f"Failed to update on-chain ID for verification: {str(e)}")

    @classmethod
    def add_verification_onchain_id(cls, proposer_wallet, onchain_id):
        """
        Add an on-chain ID to the latest on-chain verification by proposer wallet address.
        """
        try:
            verification = cls.get_registered_verification_by_proposer_wallet(proposer_wallet)
            if not verification:
                raise Exception(f"OnchainVerification with proposer wallet {proposer_wallet} not found")

            verification.onchain_id = onchain_id
            verification.save(update_fields=['onchain_id'])  # Also optimized save
            return verification

        except Exception as e:
            raise Exception(f"Failed to add on-chain ID to verification: {str(e)}")