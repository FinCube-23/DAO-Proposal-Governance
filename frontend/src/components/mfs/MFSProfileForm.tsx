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

import { useCreateMFSMutation } from "@redux/services/mfs";

import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { useEffect } from "react";
import { useToast } from "@components/ui/use-toast";
import { useNavigate } from "react-router";

const FormSchema = z.object({
  name: z.string().min(1, { message: "MFS Name is required" }),
  org_email: z.string().email({ message: "Organizational Email is required" }),
  wallet_address: z.string().optional(),
  native_currency: z.string().optional(),
  certificate: z.string().optional(),
});

export default function MFSProfileForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [, { isLoading: isCreateMFSLoading, isSuccess: isCreateMFSSuccess }] =
    useCreateMFSMutation();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      org_email: "",
      wallet_address: "",
      native_currency: "",
      certificate: "",
    },
    mode: "onChange",
  });

  //   function onSubmit(data: z.infer<typeof FormSchema>) {
  //     // createMFS({
  //     //     name: data.name,
  //     //     org_email: data.org_email,
  //     //     wallet_address: data.wallet_address,
  //     //     native_currency: data.native_currency,
  //     //     certificate: data.certificate,
  //     // });
  //   }

  useEffect(() => {
    if (isCreateMFSSuccess) {
      toast({ title: "MFS Profile created successfully" });
      navigate("/auth");
    }
  }, [isCreateMFSSuccess, navigate, toast]);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Card>
        <CardHeader>
          <CardTitle>MFS Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="flex justify-center"
              //   onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-3 w-104">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MFS Name</FormLabel>
                      <FormControl>
                        <Input className="focus:border-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="org_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organizational Email</FormLabel>
                      <FormControl>
                        <Input
                          className="focus:border-none"
                          type="email"
                          {...field}
                        />
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
                          <SelectItem value="bitcoin">Bitcoin</SelectItem>
                          <SelectItem value="ether">Ether</SelectItem>
                          <SelectItem value="matic">Matic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate</FormLabel>
                      <FormControl>
                        <Input className="focus:border-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wallet_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        <Input className="focus:border-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button isLoading={isCreateMFSLoading} type="submit">
                    Confirm
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
