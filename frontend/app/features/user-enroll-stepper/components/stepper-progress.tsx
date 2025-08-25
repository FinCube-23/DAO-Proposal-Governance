import { ArrowDown } from 'lucide-react';
import { useAccount } from 'wagmi';
import useAuthStore from '@/shared/stores/auth';

interface Props {
  current: number;
}

export default function StepperProgress({ current }: Props) {
  const { isConnected } = useAccount();
  const authStore = useAuthStore(state => state);

  return (
    <div className="grid grid-cols-11 items-center justify-center gap-3 my-3">
      <div className="col-span-1 relative">
        <div
          className={`rounded-full text-center border-4 ${
            isConnected && 'border-green-500'
          }`}
        >
          1
        </div>
        {current === 1 && (
          <div className="absolute -top-8 left-2 font-bold animate-bounce">
            <ArrowDown />
          </div>
        )}
      </div>
      <div className="col-span-9 h-1 bg-white rounded-xl"></div>
      <div className="col-span-1 relative">
        <div
          className={`rounded-full text-center border-4 ${
            authStore.profile?.organization != null && 'border-green-500'
          } `}
        >
          2
        </div>
        {current === 2 && (
          <div className="absolute -top-8 left-2 font-bold animate-bounce">
            <ArrowDown />
          </div>
        )}
      </div>
    </div>
  );
}
