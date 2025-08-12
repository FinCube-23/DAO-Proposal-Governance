import type { Organization } from '@/core/services/org/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CircleChevronUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { z } from 'zod';
import { orgApis } from '@/core/services/org';
import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import useAuthStore from '@/shared/stores/auth';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email(),
  context: z.string().min(1, { message: 'Context is required' }),
  type: z.string().min(1, { message: 'Type is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
  native_currency: z
    .string()
    .min(1, { message: 'Native currency is required' }),
  certificate: z.string().min(1, { message: 'Certificate is required' }),
});

interface Props {
  organization: Organization | null;
}

export default function OrgInfoForm({ organization }: Props) {
  const account = useAccount();
  const authStore = useAuthStore(state => state);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization?.name ?? '',
      email: organization?.email ?? '',
      context: organization?.context ?? '',
      type: organization?.type ?? '',
      location: organization?.location ?? '',
      native_currency: organization?.native_currency ?? '',
      certificate: organization?.certificate ?? '',
    },
  });

  const createOrgMutation = useMutation({
    mutationFn: orgApis.createOrg,
    onSuccess: (data) => {
      authStore.setOrg(data);
      toast.success('Organization created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create organization: ${error.message}`);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createOrgMutation.mutate({
      ...values,
      wallet_address: account.address?.toLowerCase() || '',
    });
  }

  const isFieldDisabled = (fieldName: string) => {
    if (!organization)
      return false;
    return (
      (organization as Organization)[fieldName as keyof Organization] !== ''
    );
  };

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
                    disabled={isFieldDisabled('name')}
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
                    disabled={isFieldDisabled('email')}
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
                    disabled={isFieldDisabled('context')}
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
                    disabled={isFieldDisabled('type')}
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
                    disabled={isFieldDisabled('location')}
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
                    disabled={isFieldDisabled('native_currency')}
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
                  disabled={isFieldDisabled('certificate')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-center pt-4">
          {organization
            ? (
                <div className="text-center text-green-500 font-bold">
                  You have already registered your MFS Profile.
                  {' '}
                  <br />
                  {' '}
                  Go to next
                  step
                </div>
              )
            : (
                <Button type="submit" isLoading={createOrgMutation.isPending}>
                  Submit
                  {' '}
                  <CircleChevronUp />
                </Button>
              )}
        </div>
      </form>
    </Form>
  );
}
