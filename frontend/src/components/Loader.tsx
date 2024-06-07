import { PacmanLoader } from "react-spinners";

export default function Loader() {
    return (
        <div className="w-full h-screen flex justify-center items-center">
            <PacmanLoader color="#fff" size="50px"/>
        </div>
    );
}
