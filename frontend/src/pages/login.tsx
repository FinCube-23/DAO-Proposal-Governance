import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import LoginForm from "@components/auth/LoginForm";
import { Link } from "react-router-dom";

export default function Login() {
    return (
        <div className="h-screen flex justify-center items-center w-full">
            <div className="flex flex-col gap-6">
                <Card className="w-[28rem] p-6">
                    <CardHeader>
                        <CardTitle className="text-2xl">Login</CardTitle>
                        <CardDescription>
                            Enter your email below to login to your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm />
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                to="/register"
                                className="underline underline-offset-4"
                            >
                                Register
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
