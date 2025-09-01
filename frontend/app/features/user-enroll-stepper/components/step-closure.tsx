import { CircleChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import useAuthStore from '@/shared/stores/auth';
// import useAuthStore from '@/shared/stores/auth';

interface Props {
  closeModal: () => void;
}

export default function StepClosure({ closeModal }: Props) {
  const authStore = useAuthStore(state => state);

  // Get the first organization if it exists
  const currentOrg = authStore.profile?.organizations?.[0];

  return (
    <>
      <div className="flex flex-col items-center gap-3 my-5">
        <div className="text-center">
          {currentOrg
            && 'Thank you for registering. Your application is being reviewed and is awaiting approval. You may explore the portal in the meantime.'}
        </div>
        <div className="mt-2">
          <Button onClick={closeModal}>
            Explore Portal
            {' '}
            <CircleChevronDown />
          </Button>
        </div>
      </div>
    </>
  );
}
