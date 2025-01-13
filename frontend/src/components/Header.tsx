import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
export default function Header() {
    const navigate = useNavigate();
    return (
        <div className="w-full z-50 fixed top-0">
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
                                <Button onClick={() => navigate("/login")}>
                                    Login
                                </Button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}
