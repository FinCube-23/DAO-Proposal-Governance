import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronsLeft } from "lucide-react";
export default function Profile() {
    const auth = useSelector(
        (state: RootState) => state.persistedReducer.authReducer.auth
    );
    const navigate = useNavigate();
    return (
        <Card>
            <CardHeader>
                <CardTitle>MFS Profile</CardTitle>
                <CardDescription>
                    View your MFS profile information
                </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={() => navigate("/mfs")}>
                    <ChevronsLeft />
                    Back to Dashboard
                </Button>
            </CardFooter>
        </Card>
    );
}
