import { PacmanLoader } from "react-spinners";

export default function Loader() {
  return (
    <div className="w-full flex justify-center items-center bg-black bg-opacity-50">
      <PacmanLoader color="#fff" size="50px" />
    </div>
  );
}
