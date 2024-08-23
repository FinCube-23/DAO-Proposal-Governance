import { useAuth0 } from "@auth0/auth0-react";
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

interface Props {
    isOpen: boolean;
    setOpen: any;
}

export default function ProfileDialog({ isOpen, setOpen }: Props) {
    const auth = useSelector(
        (state: RootState) => state.persistedReducer.authReducer.auth
    );

    console.log("auth", auth?.mfs);
    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-xl">MFS Profile</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">View your profile information</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <Label>MFS Name</Label>
                        <Input disabled={true} value={auth?.mfs?.name} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Email</Label>
                        <Input disabled={true} value={auth?.mfs?.org_email} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>Native Currency</Label>
                        <Input
                            disabled={true}
                            value={auth?.mfs?.native_currency}
                        />
                    </div>
                    <div>
                        Is Approved:{" "}
                        {auth?.mfs?.is_approved ? (
                            <Badge variant="success">Yes</Badge>
                        ) : (
                            <Badge variant="danger">No</Badge>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="destructive"
                        onClick={() => setOpen(false)}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
