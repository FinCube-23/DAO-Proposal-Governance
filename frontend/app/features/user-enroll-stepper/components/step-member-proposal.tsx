// import { simulateContract, writeContract } from '@wagmi/core';
// import { CircleChevronLeft, CircleChevronUp } from 'lucide-react';
// import { useEffect, useState } from 'react';
// import { toast } from 'sonner';
// import { useAccount } from 'wagmi';
// import { config } from '@/core/config';
// import contractABI from '@/core/contract/contract-abi.json';
// import { Button } from '@/shared/components/ui/button';
// import useAuthStore from '@/shared/stores/auth';

// interface Props {
//   incrementStep: () => void;
//   decrementStep: () => void;
// }

// export default function RegisterAsMemberStep({
//   incrementStep,
//   decrementStep,
// }: Props) {
//   const account = useAccount();
//   const [isRegisterLoading, setIsRegisterLoading] = useState(false);
//   const authStore = useAuthStore(state => state);

//   const [
//     updateMFS,
//     {
//       data: updateMFSData,
//       isSuccess: isUpdateMFSSuccess,
//       isError: isUpdateMFSError,
//     },
//   ] = useUpdateMFSMutation();

//   const register = async () => {
//     setIsRegisterLoading(true);
//     try {
//       const { request } = await simulateContract(config, {
//         abi: contractABI,
//         address: import.meta.env.VITE_SMART_CONTRACT_ADDRESS,
//         functionName: 'registerMember',
//         args: [
//           account.address,
//           JSON.stringify({
//             '@context': authStore.profile?.organization?.context,
//             'name': authStore.profile?.organization?.name,
//             'type': authStore.profile?.organization?.type,
//             'location': authStore.profile?.organization?.location,
//             'members': [],
//           }),
//         ],
//       });

//       const hash = await writeContract(config, request);

//       updateMFS({
//         id: authStore.profile?.organization?.id || 0,
//         trx_hash: hash,
//       });
//     }
//     catch (err: any) {
//       let errorMessage = err.message;

//       if (errorMessage.includes('reverted with the following reason:')) {
//         const match = errorMessage.match(
//           /reverted with the following reason:\s*(.*)/,
//         );
//         if (match) {
//           errorMessage = match[1];
//         }
//       }

//       if (errorMessage == 'Already a member') {
//         updateMFS({
//           id: authStore.profile?.organization?.id || 0,
//           trx_hash: '0x00',
//         });
//       }
//       else {
//         setIsRegisterLoading(false);
//       }
//       toast.error(errorMessage);
//     }
//   };

//   useEffect(() => {
//     if (isUpdateMFSSuccess) {
//       setIsRegisterLoading(false);
//       dispatch(setMfsBusinessTrxHash(updateMFSData?.trx_hash || ''));
//       incrementStep();
//     }
//   }, [isUpdateMFSSuccess, dispatch, incrementStep, updateMFSData]);

//   useEffect(() => {
//     if (isUpdateMFSError) {
//       setIsRegisterLoading(false);
//       toast.error('Something went wrong');
//     }
//   }, [isUpdateMFSError]);

//   return (
//     <div className="flex flex-col items-start gap-1 my-5">
//       <div className="text-xl font-bold">Step 3: Apply for Membership</div>
//       <div className="text-muted-foreground">
//         Submit your application to join our DAO. Current members will vote to
//         approve your membership.
//       </div>
//       <div className="w-full my-5 flex justify-end">
//         <Button onClick={register} isLoading={isRegisterLoading}>
//           Apply for Membership
//           {' '}
//           <CircleChevronUp />
//         </Button>
//       </div>
//       <div className="flex justify-between w-full">
//         <Button variant="secondary" onClick={decrementStep}>
//           <CircleChevronLeft />
//           {' '}
//           Prev
//         </Button>
//       </div>
//     </div>
//   );
// }
