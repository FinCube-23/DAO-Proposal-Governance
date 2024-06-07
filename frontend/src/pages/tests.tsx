import CurrencyExchange from "@components/currency/CurrencyExchange";
import CurrencyTranster from "@components/currency/CurrencyTranster";

export default function Tests() {
  return (
    <div className="container mx-auto mt-20">
      <div className="flex flex-col gap-5">
        {/* <CurrencyTranster /> */}
        <CurrencyExchange />
      </div>
    </div>
  )
}
