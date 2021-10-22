import React from "react";
import Card from "../../components/Card";
import DetailCard from "../../components/DetailCard";

export default function CurrencyInfo({ data }) {
    const items = [];
    if (data.currency === null) {
        items.push(["Currency ID", null]);
        items.push(["Total Amount", null]);
        items.push(["Minimum balance for new account", null]);
        items.push(["Feeer", null]);
    }
    else {
        items.push(["Currency ID", data.currency]);
        items.push(["Total Amount", data.amount]);
        items.push(["Minimum balance for new account", data.minBalance]);
        items.push(["Feeer", [
            ["Type", data.feeer.type],
            ["Receiver", data.feeer.receiver],
            ["Amount", data.feeer.amount],
        ]]);
    }

    return (
        <Card id="result" title="Currency Information">
            <DetailCard
                items={items}
            />
        </Card>
    )
};