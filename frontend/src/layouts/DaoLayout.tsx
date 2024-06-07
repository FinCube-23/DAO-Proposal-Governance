import { Outlet } from "react-router-dom";

export default function DaoLayout() {
    return (
        <div className="container mt-20 mb-10">
            <Outlet />
        </div>
    );
}
