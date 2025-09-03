import { ArrowDown } from 'lucide-react';
import { useAccount } from 'wagmi';

interface Props {
  current: number;
}

export default function StepperProgress({ current }: Props) {
  const { isConnected } = useAccount();

  return (
    <div className="grid grid-cols-17 items-center justify-center gap-2 my-3">
      {/* Step 1: Wallet Connect */}
      <div className="col-span-1 relative">
        <div
          className={`rounded-full text-center border-4 w-8 h-8 flex items-center justify-center text-sm font-medium ${
            isConnected || current >= 1
              ? 'border-green-500 bg-green-100 text-black'
              : 'border-gray-300 text-white'
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

      {/* Connector Line 1 */}
      <div className="col-span-7 h-1 bg-gray-200 rounded-xl">
        <div
          className={`h-full rounded-xl transition-all duration-300 ${
            current > 1 ? 'bg-green-500 w-full' : 'bg-gray-200 w-0'
          }`}
        />
      </div>

      {/* Step 2: Organization Selection */}
      <div className="col-span-1 relative">
        <div
          className={`rounded-full text-center border-4 w-8 h-8 flex items-center justify-center text-sm font-medium ${
            current > 2
              ? 'border-green-500 bg-green-100 text-black'
              : current === 2
                ? 'border-blue-500 bg-blue-100 text-black'
                : 'border-gray-300 text-white'
          }`}
        >
          2
        </div>
        {current === 2 && (
          <div className="absolute -top-8 left-2 font-bold animate-bounce">
            <ArrowDown />
          </div>
        )}
      </div>

      {/* Connector Line 2 */}
      <div className="col-span-7 h-1 bg-gray-200 rounded-xl">
        <div
          className={`h-full rounded-xl transition-all duration-300 ${
            current > 2 ? 'bg-green-500 w-full' : 'bg-gray-200 w-0'
          }`}
        />
      </div>

      {/* Step 3: Organization Info */}
      <div className="col-span-1 relative">
        <div
          className={`rounded-full text-center border-4 w-8 h-8 flex items-center justify-center text-sm font-medium ${
            current > 3
              ? 'border-green-500 bg-green-100 text-black'
              : current === 3
                ? 'border-blue-500 bg-blue-100 text-black'
                : 'border-gray-300 text-white'
          }`}
        >
          3
        </div>
        {current === 3 && (
          <div className="absolute -top-8 left-2 font-bold animate-bounce">
            <ArrowDown />
          </div>
        )}
      </div>
    </div>
  );
}
