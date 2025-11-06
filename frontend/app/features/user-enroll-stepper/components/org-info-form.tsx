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
  legal_entity_identifier: z
    .string()
    .length(20, { message: 'Legal entity identifier must be exactly 20 characters' }),
});

interface Props {
  organization: Organization | null;
  onSuccess?: () => void;
}

export default function OrgInfoForm({ organization, onSuccess }: Props) {
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
      // Sort organizations to keep Brain Station 23 at index 1
      authStore.sortOrganizations();
      console.warn('Organizations sorted after adding user to org');

      // Call onSuccess callback to proceed to next step
      if (onSuccess) {
        toast.success('Organization created! Proceeding to next step...');
        setTimeout(() => {
          console.warn('About to call onSuccess callback');
          onSuccess();
          console.warn('Called onSuccess callback');
        }, 1000); // Small delay to allow UI updates
      }
      else {
        console.warn('No onSuccess callback provided');
      }
    },
    onError: (error) => {
      toast.error(
        `Organization created but failed to add you as the admin: ${error.message}`,
      );
    },
  });

  const createOrgMutation = useMutation({
    mutationFn: orgApis.createOrg,
    onSuccess: (response) => {
      const data = response.data;

      authStore.setOrg({
        id: data.id,
        name: data.name,
        is_admin: true,
      });

      if (authStore.profile?.id) {
        addUserToOrgMutation.mutate({
          user_id: authStore.profile.id,
          organization_id: data.id,
        });
      }
      else {
        toast.success('Organization created successfully');

        // Sort organizations to keep Brain Station 23 at index 1
        authStore.sortOrganizations();
        console.warn(
          'Organizations sorted after creating org (no profile ID case)',
        );

        // Call onSuccess callback to proceed to next step
        if (onSuccess) {
          toast.success(
            'User added to organization! Proceeding to next step...',
          );
          setTimeout(() => {
            console.warn('About to call onSuccess callback from addUserToOrg');
            onSuccess();
            console.warn('Called onSuccess callback from addUserToOrg');
          }, 1000); // Small delay to allow UI updates
        }
        else {
          console.warn('No onSuccess callback provided in addUserToOrg');
        }
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Org Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    disabled={isFieldDisabled('name')}
                    className="text-sm sm:text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Org Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    disabled={isFieldDisabled('email')}
                    className="text-sm sm:text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Main St, City, Country"
                    disabled={isFieldDisabled('address')}
                    className="text-sm sm:text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Type</FormLabel>
                <FormControl>
                  <Select
                    disabled={isFieldDisabled('type')}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Select organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plc" className="text-sm sm:text-base">PLC</SelectItem>
                      <SelectItem value="llc" className="text-sm sm:text-base">LLC</SelectItem>
                      <SelectItem value="inc" className="text-sm sm:text-base">INC</SelectItem>
                      <SelectItem value="other" className="text-sm sm:text-base">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:gap-5">
          <FormField
            control={form.control}
            name="legal_entity_identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Legal Entity Identifier</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter legal entity identifier"
                    disabled={isFieldDisabled('legal_entity_identifier')}
                    className="text-sm sm:text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs sm:text-sm" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-center pt-3 sm:pt-4">
          {organization
            ? (
                <div className="text-center text-green-500 font-bold text-sm sm:text-base px-4">
                  You have already registered your MFS Profile.
                  {' '}
                  <br />
                  {' '}
                  Go to next
                  step
                </div>
              )
            : (
                <Button
                  type="submit"
                  className="text-sm sm:text-base"
                  isLoading={
                    createOrgMutation.isPending || addUserToOrgMutation.isPending
                  }
                >
                  Submit
                  {' '}
                  <CircleChevronUp className="ml-1 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              )}
        </div>
      </form>
    </Form>
  );
}
