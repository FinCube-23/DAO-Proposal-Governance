import { CircleChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface Props {
  closeModal: () => void;
  isFromOrgCreation?: boolean;
}

export default function StepClosure({ closeModal, isFromOrgCreation = false }: Props) {
  return (
    <>
      <div className="flex flex-col items-center gap-3 my-5">
        <div className="text-center">
          {isFromOrgCreation
            ? 'Thank you for creating your organization. Your application is being reviewed and is awaiting approval. You may explore the portal in the meantime.'
            : 'Thank you for registering. Your application is being reviewed and is awaiting approval. You may explore the portal in the meantime.'}
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
