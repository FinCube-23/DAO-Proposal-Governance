import { Button } from "@components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export default function VoterList() {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div>
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className=" space-y-2"
            >
                <div className="flex items-center justify-between space-x-4 px-4">
                    <h1 className="text-sm font-semibold">
                        Voter List
                    </h1>
                    <CollapsibleTrigger asChild>
                        <Button variant="default">
                            {isOpen ? "Minimize" : "View All"}
                        </Button>
                    </CollapsibleTrigger>
                </div>
                {!isOpen && <div className="rounded-md border px-4 py-3 font-mono text-sm">
                    0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a1
                </div>}
                <CollapsibleContent className="space-y-2">
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                        0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a1
                    </div>
                    <div className="rounded-md border px-4 py-3 font-mono text-sm">
                        0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a3
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
