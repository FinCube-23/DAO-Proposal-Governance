import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { DialogHeader } from '@/shared/components/ui/dialog';

export default function NewProposalDialog() {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Proposal Type</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
