import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { SparklesCore } from '@/shared/components/sparkles';
import { Button } from '@/shared/components/ui/button';
import useAuthStore from '@/shared/stores/auth';

export default function Home() {
  const authStore = useAuthStore(state => state);
  const navigate = useNavigate();

  return (
    <div className="h-screen relative w-full flex flex-col items-center justify-center overflow-hidden rounded-md">
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full z-0"
          particleColor="#FFFFFF"
        />
      </div>
      <div className="flex flex-col items-center gap-5">
        <div className="relative z-20">
          <div className="absolute w-[4.5rem] h-1 bg-green-500 -top-2 left-1"></div>
          <h1 className="md:text-7xl text-3xl lg:text-6xl font-bold text-center text-white relative z-20">
            FinCube 23
          </h1>
          <div className="absolute w-[4.5rem] h-1 bg-green-500 -bottom-4 right-1"></div>
        </div>
        <h2 className="text-xl text-center text-white">
          Secure
          <span className="text-green-500 font-bold">.</span>
          {' '}
          Swift
          <span className="text-green-500 font-bold">.</span>
          {' '}
          Seamless
        </h2>
        <div className="z-40 flex gap-4">
          {authStore.access
            ? (
                <Button onClick={() => navigate('/organization')} variant="secondary">
                  Back to Dashboard
                  <ArrowRight size={20} />
                </Button>
              )
            : (
                <>
                  <Button
                    onClick={() => {
                      navigate('/login');
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate('/register');
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
        </div>
      </div>
    </div>
  );
}
