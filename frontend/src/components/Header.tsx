import { Button } from "@components/ui/button";
import { Link } from "react-router-dom";

export default function Header() {
    return (
        <nav className="navbar-gradient p-4 fixed top-0 w-full z-50">
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
                                <Button>Connect</Button>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
