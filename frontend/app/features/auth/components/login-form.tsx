import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import useAuthStore from "@/shared/stores/auth";
import { fetchMe } from "../apis/fetch-me";
import { login } from "../apis/login";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export default function LoginForm() {
  const router = useRouter();
  const authStore = useAuthStore((state) => state);

  const fetchMeMutation = useMutation({
    mutationKey: ["fetchMe"],
    mutationFn: fetchMe,
    onSuccess: (data) => {
      authStore.setProfile(data);
      if (data?.is_active) {
        router.push("/organization");
      }
    },
    onError: (error) => {
      console.error("Fetch me failed", error);
      toast.error("Failed to fetch user data");
    },
  });

  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: login,
    onSuccess: (data) => {
      authStore.setTokens({ access: data.tokens.access });
      fetchMeMutation.mutate();
    },
    onError: (error) => {
      console.error("Login failed", error);
      toast.error("Login failed. Please check your credentials.");
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
