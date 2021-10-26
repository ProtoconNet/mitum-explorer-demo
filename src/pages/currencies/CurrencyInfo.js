import React from "react";
import LoadingIcon from "../../components/LoadingIcon";

import Card from "../../components/views/Card";
import DetailCard from "../../components/views/DetailCard";

import keys from "../../lib/keys.json";

export default function CurrencyInfo({ data, isLoad }) {

    const items = () => {
        const items = [];
        if (data.currency === null) {
            items.push([keys.currency.currency, null]);
            items.push([keys.currency.amount, null]);
            items.push([keys.currency.min, null]);
            items.push([keys.currency.feeer, null]);
        }
        else {
            items.push([keys.currency.currency, data.currency]);
            items.push([keys.currency.amount, data.amount]);
            items.push([keys.currency.min, data.minBalance]);
            items.push([keys.currency.feeer, [
                [keys.feeer.type, data.feeer.type],
                [keys.feeer.receiver, data.feeer.receiver],
                [keys.feeer.amount, data.feeer.amount],
            ]]);
        }
        return items;
    }

    return (
        <Card id="result" title="Currency Information">
            {
                isLoad
                ? <DetailCard items={items()} />
                : <LoadingIcon />
            }
        </Card>
    )
};