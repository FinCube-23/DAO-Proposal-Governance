import type { Organization } from '@/core/services/org/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CircleChevronUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import useAuthStore from '@/shared/stores/auth';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Organization name is required' }),
  email: z.email({ message: 'Valid email is required' }),
  type: z.string().min(1, { message: 'Organization type is required' }),
  address: z.string().min(1, { message: 'Address is required' }),
  legal_entity_identifier: z.string().min(1, { message: 'Legal entity identifier is required' }),
});

interface Props {
  organization: Organization | null;
}

export default function OrgInfoForm({ organization }: Props) {
  const authStore = useAuthStore(state => state);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization?.name ?? '',
      email: organization?.email ?? '',
      type: organization?.type ?? '',
      address: organization?.address ?? '',
      legal_entity_identifier: organization?.legal_entity_identifier ?? '',
    },
  });

  const addUserToOrgMutation = useMutation({
    mutationFn: orgApis.addUserToOrg,
    onSuccess: (_data) => {
      toast.success(`Organization created successfully!`);
    },
    onError: (error) => {
      toast.error(`Organization created but failed to add you as the admin: ${error.message}`);
    },
  });

  const createOrgMutation = useMutation({
    mutationFn: orgApis.createOrg,
    onSuccess: (response) => {
      // Extract the actual organization data from the response
      const data = response.data;

      // First, set the organization in the auth store
      authStore.setOrg({
        id: data.id,
        name: data.name,
        is_admin: true, // User who creates the organization is automatically an admin
      });

      // Then, add the current user to the newly created organization
      if (authStore.profile?.id) {
        addUserToOrgMutation.mutate({
          user_id: authStore.profile.id,
          organization_id: data.id,
        });
      }
      else {
        toast.success('Organization created successfully');
      }
    },
    onError: (error) => {
      toast.error(`Failed to create organization: ${error.message}`);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createOrgMutation.mutate({
      ...values,
      organization_admin_id: authStore.profile?.id || 0,
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
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Main St, City, Country"
                    disabled={isFieldDisabled('address')}
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
                  <Select
                    disabled={isFieldDisabled('type')}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plc">PLC</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="inc">INC</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-5">
          <FormField
            control={form.control}
            name="legal_entity_identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legal Entity Identifier</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter legal entity identifier"
                    disabled={isFieldDisabled('legal_entity_identifier')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                <Button type="submit" isLoading={createOrgMutation.isPending || addUserToOrgMutation.isPending}>
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
