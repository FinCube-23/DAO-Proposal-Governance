import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import CurrencyExchangeForm from "./CurrencyExchangeForm";

export default function CurrencyExchange() {
    const [isLinked, setIsLinked] = useState(false);

    const handleLinkMFS = () => {
        setIsLinked(true);
    };
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-4xl">
                        Currency Exchange
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center">
                        <div className="flex mb-7">
                            <img
                                src="/images/currency_exchange.png"
                                alt="Phone Arrow Up"
                                className="w-48 h-48 rotate-12"
                            />
                        </div>
                        {isLinked ? (
                            <>
                                <div>
                                    <CurrencyExchangeForm />
                                </div>
                            </>
                        ) : (
                            <>
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
