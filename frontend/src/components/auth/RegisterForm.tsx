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
import { useRegisterMutation } from "@redux/services/auth";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router";

const formSchema = z.object({
  name: z.string().min(3, { message: "Name is too short" }),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  role: z.string(),
});

export default function RegisterForm() {
  const navigate = useNavigate();
  const [
    register,
    {
      data: registerData,
      isLoading: isRegisterLoading,
      isSuccess: isRegisterSuccess,
      error: registerError,
      isError: isRegisterError,
    },
  ] = useRegisterMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "mfs",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    register(values);
  }

  useEffect(() => {
    if (isRegisterSuccess) {
      console.log("Register success", registerData);
      toast.success("Registration successful");
      navigate("/login");
    }
  }, [isRegisterSuccess, navigate, registerData]);

  useEffect(() => {
    if (isRegisterError) {
      const err = registerError as any;
      toast.error(err.data.message);
    }
  }, [isRegisterError, registerError]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="m@example.com" {...field} />
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
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mfs">Organization</SelectItem>
                  <SelectItem value="user" disabled={true}>
                    User
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" isLoading={isRegisterLoading} type="submit">
          Register
        </Button>
      </form>
    </Form>
  );
}
