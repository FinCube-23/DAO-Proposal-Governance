import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import CurrencyTransferForm from "./CurrencyTransferForm";

export default function CurrencyTranster() {
    const [isLinked, setIsLinked] = useState(false);

    const handleLinkMFS = () => {
        setIsLinked(true);
    };
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-4xl">
                        Currency Transfer
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center">
                        {isLinked ? (
                            <>
                                <div className="flex">
                                    <div className="relative">
                                        <img
                                            src="/images/phone_up_arrow.png"
                                            alt="Phone Arrow Up"
                                            className="w-48 h-48 rotate-12"
                                        />
                                        <div className="w-4 h-4 bg-red-500 rounded-full absolute top-12 left-24"></div>
                                        <div className="w-4 h-4 bg-green-500 rounded-full absolute top-4 left-36"></div>
                                        <div className="w-4 h-4 bg-green-500 rounded-full absolute top-0 left-48"></div>
                                        <div className="w-4 h-4 bg-green-500 rounded-full absolute top-4 left-60"></div>
                                    </div>

                                    <div className="relative">
                                        <img
                                            src="/images/phone_tick.png"
                                            alt="Phone Tick"
                                            className="w-48 h-48 -rotate-12"
                                        />
                                        <div className="w-4 h-4 bg-green-500 rounded-full absolute top-12 left-20"></div>
                                    </div>
                                </div>
                                <div>
                                    <CurrencyTransferForm />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex">
                                    <img
                                        src="/images/phone_up_arrow.png"
                                        alt="Phone Arrow Up"
                                        className="w-48 h-48 rotate-12"
                                    />

                                    <img
                                        src="/images/phone_tick.png"
                                        alt="Phone Tick"
                                        className="w-48 h-48 -rotate-12"
                                    />
                                </div>
                                <div>
                                    <Button onClick={handleLinkMFS}>
                                        Link MFS
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
