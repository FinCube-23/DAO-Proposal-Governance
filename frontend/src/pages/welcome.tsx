import { Button } from "@components/ui/button";
import { SparklesCore } from "@components/ui/sparkles";
import { Link } from "react-router-dom";

export default function welcome() {
  return (
    <>
      <div className="h-screen relative w-full bg-green-300 flex flex-col items-center justify-center overflow-hidden rounded-md">
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
          <h1 className="md:text-7xl text-3xl lg:text-6xl font-bold text-center text-white relative z-20">
            FinCube 23
          </h1>
          <div className="z-40"><Link to={"/dashboard"}><Button>Go to Demo Dashboard</Button></Link></div>
        </div>
      </div>
    </>
  )
}
