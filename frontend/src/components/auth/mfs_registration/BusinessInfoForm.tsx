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
import { useDispatch } from "react-redux";
import { setMfsBusiness } from "@redux/slices/auth";
import { MFSBusiness } from "@redux/api/types";
import { CircleChevronUp } from "lucide-react";

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

interface Props {
  mfsBusiness: MFSBusiness | null;
}

export default function BusinessInfoForm({ mfsBusiness }: Props) {
  const dispatch = useDispatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: mfsBusiness?.name ?? "",
      email: mfsBusiness?.email ?? "",
      context: mfsBusiness?.context ?? "",
      type: mfsBusiness?.type ?? "",
      location: mfsBusiness?.location ?? "",
      native_currency: mfsBusiness?.native_currency ?? "",
      certificate: mfsBusiness?.certificate ?? "",
    },
  });

  const account = useAccount();

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMFS({ ...values, wallet_address: account.address || "" });
  }

  const isFieldDisabled = (fieldName: string) => {
    if (!mfsBusiness) return false;
    return (mfsBusiness as MFSBusiness)[fieldName as keyof MFSBusiness] !== "";
  };

  const [
    createMFS,
    {
      data: mfsData,
      isLoading: isMFSLoading,
      isSuccess: isMFSSuccess,
      isError: isMFSError,
    },
  ] = useCreateMFSMutation();

  useEffect(() => {
    if (isMFSSuccess) {
      dispatch(setMfsBusiness(mfsData));
    }
  }, [isMFSSuccess, dispatch, mfsData]);

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
                  <Input
                    type="text"
                    disabled={isFieldDisabled("name")}
                    {...field}
                  />
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
                    disabled={isFieldDisabled("email")}
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
                    disabled={isFieldDisabled("context")}
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
                    disabled={isFieldDisabled("type")}
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
                  <Input
                    placeholder="BGD | USA"
                    disabled={isFieldDisabled("location")}
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
                <FormControl>
                  <Input
                    placeholder="ETH | USDT"
                    disabled={isFieldDisabled("native_currency")}
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
                  disabled={isFieldDisabled("certificate")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-center pt-4">
          {mfsBusiness ? (
            <div className="text-center text-green-500 font-bold">
              You have already registered your MFS Profile. <br /> Go to next
              step
            </div>
          ) : (
            <Button type="submit" isLoading={isMFSLoading}>
              Submit <CircleChevronUp />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
