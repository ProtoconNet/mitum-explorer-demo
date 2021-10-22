import React from "react";
import Card from "../../components/Card";
import List from "../../components/List";

export default function CurrencyList({onPrev, onNext, onSearchCurrency, currencies, idx}) {
    return (
        <Card id="result" title="Currencies">
            <List columns={["Currency ID"]} items={
                currencies.slice(
                    idx,
                    (idx + 10 >= currencies.length
                        ? currencies.length
                        : idx + 10)
                )}
                onElementClick={[(currency) => onSearchCurrency(currency)]}
                onPrevClick={() => onPrev()}
                onNextClick={() => onNext()}
                isLastPage={idx + 10 >= currencies.length}
                isFirstPage={idx === 0} />
        </Card>
    )
}