import React from "react";
import LoadingIcon from "../../components/LoadingIcon";

import Card from "../../components/views/Card";
import DetailCard from "../../components/views/DetailCard";

import page from "../../lib/page.json";
import keys from "../../lib/keys.json";
import DataView from "../../components/DataView";
import { parseDecimalFromAmount } from "../../lib";

export default function CurrencyInfo({ data, isLoad, history }) {

    const items = () => {
        const items = [];
        if (data.currency === null) {
            items.push([keys.currency.currency, null]);
            items.push([keys.currency.amount, null]);
            items.push([keys.currency.balance, null]);
            items.push([keys.feeer.feeer, null]);
        }
        else {
            items.push([keys.currency.currency, data.currency]);
            items.push([keys.currency.amount, parseDecimalFromAmount(data.amount)]);
            items.push([keys.currency.balance, parseDecimalFromAmount(data.minBalance)]);

            var upToFeeer = [];
            if(data.feeer.type === 'fixed') {
                upToFeeer.push(
                    [keys.feeer.receiver, data.feeer.receiver, [
                        null,
                        (x) => history.push(`${page.account.default}/${x}`)
                    ]]
                );
                upToFeeer.push(
                    [keys.feeer.amount, parseDecimalFromAmount(data.feeer.amount)]
                );
            }
            else if (data.feeer.type === 'ratio') {
                upToFeeer.push(
                    [keys.feeer.receiver, data.feeer.receiver, [
                        null,
                        (x) => history.push(`${page.account.default}/${x}`)
                    ]]
                );
                upToFeeer.push(
                    [keys.feeer.ratio, data.feeer.ratio],
                );
                upToFeeer.push(
                    [keys.feeer.min, parseDecimalFromAmount(data.feeer.min)]
                );
                upToFeeer.push(
                    [keys.feeer.max, parseDecimalFromAmount(data.feeer.max)]
                );
            }
        }

        items.push([keys.currency.feeer, [
            [keys.feeer.type, data.feeer.type],
            ...upToFeeer
        ]]);

        return items;
    }

    if (isLoad) {
        return (
            <Card id="result" title="Currency Information">
                <DetailCard keyIndex={null} items={items()} />
                <DataView data={data.raw} />
            </Card>
        )
    }
    else {
        return (
            <Card id="result" title="Currency Information">
                <LoadingIcon />
            </Card>
        )
    }
};