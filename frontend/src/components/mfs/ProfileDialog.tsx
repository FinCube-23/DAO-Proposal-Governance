import { Dialog, DialogContent, DialogHeader } from "@components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import MFSProfileForm from "./MFSProfileForm";

interface Props {
  isOpen: boolean;
  setOpen: any;
  type: "details" | "form";
}

export default function ProfileDialog({ isOpen, setOpen, type }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">MFS Profile</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            View your profile information
          </DialogDescription>
        </DialogHeader>
        {type === "details" ? <></> : <MFSProfileForm />}
      </DialogContent>
    </Dialog>
  );
}
