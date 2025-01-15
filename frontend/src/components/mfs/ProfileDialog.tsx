import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
} from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import MFSProfileForm from "./MFSProfileForm";

interface Props {
    isOpen: boolean;
    setOpen: any;
    type: "details" | "form";
}

export default function ProfileDialog({ isOpen, setOpen, type }: Props) {
    const auth = useSelector(
        (state: RootState) => state.persistedReducer.authReducer
    );

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-xl">MFS Profile</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">View your profile information</DialogDescription>
                </DialogHeader>
                {type === "details" ? (
                    <></>
                ): (
                    <MFSProfileForm />
                )}
            </DialogContent>
        </Dialog>
    );
}
