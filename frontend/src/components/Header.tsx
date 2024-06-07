import { Link } from "react-router-dom";
import LoginButton from "./auth/LoginButton";
import { useAuth0 } from "@auth0/auth0-react";

export default function Header() {
    const { isAuthenticated, isLoading } = useAuth0();

    return (
        <div className="w-full z-50 fixed top-0">
            {!isLoading && !isAuthenticated && (
                <div className="w-full flex justify-center">
                    Are you a MFS admin? Access the admin portal from{" "}
                    <Link
                        className="text-blue-500 ml-1 hover:underline font-bold"
                        to="/mfs"
                    >
                        here
                    </Link>
                    .
                </div>
            )}

            <nav className="navbar-gradient p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <Link to="/" className="text-white font-bold text-xl">
                            {import.meta.env.VITE_APP_NAME || "Brand"}
                        </Link>
                    </div>

                    <div>
                        <ul className="flex space-x-4">
                            <li>
                                <a
                                    href="#"
                                    className="text-white hover:text-gray-300"
                                >
                                    <LoginButton />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}
