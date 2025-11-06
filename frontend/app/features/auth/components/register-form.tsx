import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import * as countryCodes from "country-codes-list";
import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { register } from "../apis/register";

// Get country codes for the dropdown

const formSchema = z
  .object({
    first_name: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" }),
    last_name: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    country_code: z
      .string()
      .min(1, { message: "Please select a country code" }),
    contact_number: z
      .string()
      .min(7, { message: "Phone number must be at least 7 digits" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    password_confirm: z.string().min(8, {
      message: "Password confirmation must be at least 8 characters",
    }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords don't match",
    path: ["password_confirm"],
  });

export default function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success("Registration successful");
      navigate("/login");
    },
    onError: (error: any) => {
      // Check different possible error structures
      let errorData = null;

      // Try different ways the error data might be structured
      if (error.response?.data) {
        errorData = error.response.data;
      } else if (error.data) {
        errorData = error.data;
      } else if (error.response?.body) {
        errorData = error.response.body;
      } else if (error.body) {
        errorData = error.body;
      }

      console.error("Extracted error data:", errorData);

      // Check if we have field validation errors
      if (errorData && typeof errorData === "object") {
        const errorMessages: string[] = [];

        // Extract error messages from each field
        Object.keys(errorData).forEach((field) => {
          const fieldError = errorData[field];
          if (Array.isArray(fieldError)) {
            errorMessages.push(fieldError[0]);
          } else if (typeof fieldError === "string") {
            errorMessages.push(fieldError);
          }
        });

        if (errorMessages.length > 0) {
          // Show the first error message
          const rawMessage = errorMessages[1];
          const match = rawMessage.match(/string='([^']+)'/);
          toast.error(match ? match[1] : rawMessage);

          return;
        }
      }

      // Fallback error message
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });

  const countryCodesArray = useMemo(() => {
    const uniqueCountryCodes = new Map();
    countryCodes
      .all()
      .filter((country) => country.countryCallingCode)
      .forEach((country) => {
        const code = `+${country.countryCallingCode}`;
        if (!uniqueCountryCodes.has(code)) {
          uniqueCountryCodes.set(code, {
            id: country.countryCode,
            country: country.countryNameEn,
            code,
            value: code,
            label: `${country.countryCode} (${code})`, // Show country code instead of full name
          });
        }
      });
    return Array.from(uniqueCountryCodes.values()).sort((a, b) =>
      a.country.localeCompare(b.country)
    );
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      country_code: "+880",
      contact_number: "",
      password: "",
      password_confirm: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Concatenate country code with phone number for the API
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      contact_number: values.country_code + values.contact_number,
      password: values.password,
      password_confirm: values.password_confirm,
    };
    registerMutation.mutate(payload);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* First Name and Last Name side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email */}
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

        {/* Country Code and Contact Number side by side */}
        <div className="flex flex-col sm:flex-row gap-2">
          <FormField
            control={form.control}
            name="country_code"
            render={({ field }) => (
              <FormItem className="w-full sm:w-32 flex-shrink-0">
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    {countryCodesArray.map((item) => (
                      <SelectItem key={item.id} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_number"
            render={({ field }) => (
              <FormItem className="flex-1 min-w-0">
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Password and Confirm Password in separate rows */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password must be 8 characters long"
                    className="[&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-gray-400" />
                    ) : (
                      <Eye className="size-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password_confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPasswordConfirm ? "text" : "password"}
                    className="[&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="size-5 text-gray-400" />
                    ) : (
                      <Eye className="size-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="w-full"
          isLoading={registerMutation.isPending}
          type="submit"
        >
          Register
        </Button>
      </form>
    </Form>
  );
}
