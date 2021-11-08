import React, { useState } from "react";
import './DataView.scss';
import { button } from '../lib/message.json';

export default function DataView({ data, isSmall }) {
    const [isOpen, setOpen] = useState(false);
    if(!typeof data === "string") {
        data = JSON.stringify(data, null, 4);
    }

    return (
        <section className="data-view-container">
            <button id={ isSmall ? "small-green-button" : "green-button" }
                onClick={() => setOpen(!isOpen)}>
                {
                    isOpen
                        ? button.close
                        : button.open
                }
            </button>
            {
                isOpen
                    ? (
                        <pre id={ isSmall ? "small-raw-data" : "raw-data"}>
                            {data}
                        </pre>
                    )
                    : false
            }
        </section>
    )
}