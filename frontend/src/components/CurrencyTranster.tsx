import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function CurrencyTranster() {
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
                            <Button>Link MFS</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
