import React from "react";
import LoadingIcon from "../../components/LoadingIcon";
import Card from "../../components/views/Card";
import List from "../../components/views/List";
import columns from '../../lib/columns.json';

export default function CurrencyList({ onPrev, onNext, onSearchCurrency, currencies, idx, isLoad }) {
    return (
        <Card id="result" title="Currencies">
            {
                isLoad
                    ? (
                        <List columns={Object.values(columns.currencies)} items={
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
                    )
                    : <LoadingIcon />
            }
        </Card>
    )
}