// import { Loader2 } from 'lucide-react';

// import { Badge } from '@/shared/components/ui/badge';
// import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

// import { useUserOrg } from '../hooks/use-user-org';

// export function UserOrgDetails() {
//   const { data: orgData, isLoading, error } = useUserOrg();

//   if (isLoading) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Organization Details</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex items-center justify-center py-8">
//             <Loader2 className="h-6 w-6 animate-spin" />
//             <span className="ml-2">Loading organization...</span>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (error) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Organization Details</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-red-600">
//             Error loading organization:
//             {' '}
//             {error.message}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (!orgData) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Organization Details</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-gray-500">No organization data available</div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const org = orgData;

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center justify-between">
//           {org.name}
//           <Badge variant={org.status === 'approved' ? 'default' : 'secondary'}>
//             {org.status === 'approved' ? 'Approved' : 'Pending'}
//           </Badge>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="text-sm font-medium text-gray-500">Email</label>
//             <p className="text-sm">{org.email}</p>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">Type</label>
//             <p className="text-sm">{org.type}</p>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">Location</label>
//             <p className="text-sm">{org.location}</p>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">Native Currency</label>
//             <p className="text-sm">{org.native_currency}</p>
//           </div>
//         </div>

//         {org.wallet_address && (
//           <div>
//             <label className="text-sm font-medium text-gray-500">Wallet Address</label>
//             <p className="text-sm font-mono break-all">{org.wallet_address}</p>
//           </div>
//         )}

//         {org.trx_hash && (
//           <div>
//             <label className="text-sm font-medium text-gray-500">Transaction Hash</label>
//             <p className="text-sm font-mono break-all">{org.trx_hash}</p>
//           </div>
//         )}

//         <div className="flex items-center gap-2">
//           <Badge variant="outline">
//             On-Chain Status:
//             {' '}
//             {org.membership_onchain_status}
//           </Badge>
//           {org.proposal_onchain_id && (
//             <Badge variant="outline">
//               Proposal ID:
//               {' '}
//               {org.proposal_onchain_id}
//             </Badge>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
