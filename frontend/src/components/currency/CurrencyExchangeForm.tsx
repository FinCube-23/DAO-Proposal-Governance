import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@components/ui/input";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const FormSchema = z.object({
    amount: z.string().min(1, { message: "Amount is required" }),
    destination_mfs: z
        .string()
        .min(1, { message: "Destination MFS is required" }),
    origin_mfs: z.string().min(1, { message: "Origin MFS is required" }),
});

export default function CurrencyExchangeForm() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            amount: "",
            destination_mfs: "",
            origin_mfs: "",
        },
        mode: "onChange",
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data);
    }
    return (
        <Form {...form}>
            <form className="flex justify-center" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-3 w-104">
                    <FormField
                        control={form.control}
                        name="destination_mfs"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Choose destination MFS</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Not Selected!" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="paypal">
                                            Paypal
                                        </SelectItem>
                                        <SelectItem value="chass">
                                            Chass
                                        </SelectItem>
                                        <SelectItem value="venmo">
                                            Venmo
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="destination_mfs"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Choose destination MFS</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Not Selected!" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="paypal">
                                            Paypal
                                        </SelectItem>
                                        <SelectItem value="chass">
                                            Chass
                                        </SelectItem>
                                        <SelectItem value="venmo">
                                            Venmo
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Enter transfer amount</FormLabel>
                                <FormControl>
                                    <Input
                                        className="focus:border-none"
                                        type="number"
                                        step="0.01"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                        <Button type="submit">Confirm</Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
