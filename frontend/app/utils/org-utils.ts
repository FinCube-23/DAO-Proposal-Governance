import { orgApis } from '@/core/services/org';

// Utility function to fetch user organization by user ID
export async function fetchUserOrganization(userId: number) {
  try {
    const response = await orgApis.getOrg(userId);
    return response;
  }
  catch (error) {
    console.error('Failed to fetch organization:', error);
    throw error;
  }
}

// Utility function to fetch organization with error handling
export async function safelyFetchUserOrg(userId: number | null | undefined) {
  if (!userId) {
    return null;
  }

  try {
    return await fetchUserOrganization(userId);
  }
  catch (error) {
    console.error('Error fetching user organization:', error);
    return null;
  }
}
