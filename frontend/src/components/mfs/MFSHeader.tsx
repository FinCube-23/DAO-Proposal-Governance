import { SidebarTrigger } from "@components/ui/sidebar";
import { ChevronRightIcon } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router";

export default function MFSHeader() {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);
    return (
        <div className="fixed flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 w-full">
            <SidebarTrigger />
            <div
                data-orientation="vertical"
                role="none"
                className="shrink-0 bg-border w-[1px] mr-2 h-4"
            ></div>
            <div className="flex items-center gap-5 capitalize">
                {pathnames.map((name, index) => {
                    const routeTo = `/${pathnames
                        .slice(0, index + 1)
                        .join("/")}`;
                    const isLast = index === pathnames.length - 1;

                    return isLast ? (
                        <span
                            key={name}
                            className="text-muted-foreground"
                        >
                            {name}
                        </span> // Last segment is not a link
                    ) : (
                        <React.Fragment key={name}>
                            <span className="hover:underline">
                                <Link to={routeTo}>{name}</Link>
                            </span>
                            <ChevronRightIcon />
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
