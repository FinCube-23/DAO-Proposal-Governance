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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@components/ui/button";
import { useCreateMFSMutation } from "@redux/services/mfs";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAccount } from "wagmi";

interface Props {
    setCanGoNext: (value: boolean) => void;
}

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email(),
    context: z.string().min(1, { message: "Context is required" }),
    type: z.string().min(1, { message: "Type is required" }),
    location: z.string().min(1, { message: "Location is required" }),
    native_currency: z
        .string()
        .min(1, { message: "Native currency is required" }),
    certificate: z.string().min(1, { message: "Certificate is required" }),
});

export default function BusinessInfoForm({ setCanGoNext }: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            context: "",
            type: "",
            location: "",
            native_currency: "",
            certificate: "",
        },
    });

    const account = useAccount();

    function onSubmit(values: z.infer<typeof formSchema>) {
        createMFS({ ...values, wallet_address: account.address || "" });
    }

    const [
        createMFS,
        {
            isLoading: isMFSLoading,
            isSuccess: isMFSSuccess,
            isError: isMFSError,
        },
    ] = useCreateMFSMutation();

    useEffect(() => {
        if (isMFSSuccess) {
            setCanGoNext(true);
        }
    }, [isMFSSuccess]);

    useEffect(() => {
        if (isMFSError) {
            toast.error("Failed to create MFS");
        }
    }, [isMFSError]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <div className="grid grid-cols-2 gap-5">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Org Name</FormLabel>
                                <FormControl>
                                    <Input type="text" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Org Email</FormLabel>
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
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <FormField
                        control={form.control}
                        name="context"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Context</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="http://www.example.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="DAO | Organization"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="BGD | USA" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="native_currency"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Native Currency</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="ETH | USDT"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="certificate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Certificate</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Certificate URL"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-center pt-4">
                    <Button variant="secondary" type="submit" isLoading={isMFSLoading}>
                        Submit
                    </Button>
                </div>
            </form>
        </Form>
    );
}
