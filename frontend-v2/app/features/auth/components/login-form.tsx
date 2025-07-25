import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import useAuthStore from "@/shared/stores/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { login } from "../apis/login";
import { fetchMe } from "../apis/fetch-me";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const authStore = useAuthStore(state => state);

  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: login,
    onSuccess: (data) => {
      console.log("Login successful", data);
      authStore.setTokens({ access: data.access_token });
      fetchMe();
    },
    onError: (error) => {
      console.error("Login failed", error);
      toast.error("Login failed. Please check your credentials.");
    },
  });

  const fetchMeMutation = useMutation({
    mutationKey: ["fetchMe"],
    mutationFn: fetchMe,
    onSuccess: (data) => {
      console.log("Fetch me success", data);
      authStore.setProfile(data);
      if (data?.role === "mfs") {
        navigate("/organization/dashboard");
      }
    },
    onError: (error) => {
      console.error("Fetch me failed", error);
      toast.error("Failed to fetch user data");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    loginMutation.mutate(values);
  }

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
        <Button
          className="w-full"
          isLoading={loginMutation.isPending || fetchMeMutation.isPending}
          type="submit"
        >
          {loginMutation.isPending
            ? "Logging in..."
            : fetchMeMutation.isPending
              ? "Fetching user data..."
              : "Login"}
        </Button>
      </form>
    </Form>
  );
}
