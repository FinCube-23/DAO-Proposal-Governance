import { Button } from "@components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLazyFetchMeQuery, useLoginMutation } from "@redux/services/auth";
import { setProfile, setTokens } from "@redux/slices/auth";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export default function LoginForm() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [
        login,
        {
            data: loginData,
            isLoading: isLoginLoading,
            isSuccess: isLoginSuccess,
            error: loginError,
            isError: isLoginError,
        },
    ] = useLoginMutation();

    const [
        fetchMe,
        {
            data: myData,
            error: fetchMeError,
            isFetching: isFetchMeLoading,
            isSuccess: isFetchMeSuccess,
            isError: isFetchMeError,
        },
    ] = useLazyFetchMeQuery();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        login(values);
    }

    useEffect(() => {
        if (isLoginSuccess && loginData) {
            console.log("Login success", loginData);
            dispatch(setTokens({ access: loginData?.access_token }));
            fetchMe();
        }
    }, [isLoginSuccess, dispatch, fetchMe, loginData]);

    useEffect(() => {
        if (isFetchMeSuccess) {
            console.log("Fetch me success", myData);
            dispatch(setProfile(myData));
            if (myData?.role === "mfs") {
                navigate("/mfs/dashboard");
            }
        }
    }, [isFetchMeSuccess]);

    useEffect(() => {
        if (isLoginError) {
            const err = loginError as any;
            toast.error(err.data.message);
        }
    }, [isLoginError, loginError]);

    useEffect(() => {
        if (isFetchMeError) {
            console.log("Fetch me error", fetchMeError);
            toast.error("Failed to fetch user data");
        }
    }, [isFetchMeError, fetchMeError]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="m@example.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    className="w-full"
                    isLoading={isLoginLoading || isFetchMeLoading}
                    type="submit"
                >
                    {isLoginLoading
                        ? "Logging in..."
                        : isFetchMeLoading
                        ? "Fetching user data..."
                        : "Login"}
                </Button>
            </form>
        </Form>
    );
}
