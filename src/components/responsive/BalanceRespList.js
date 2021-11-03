import React, { Component } from 'react';
import page from '../../lib/page.json';
import message from '../../lib/message.json';
import './BalanceRespList.scss';
import { replace } from '../../lib/message.json';
import { key } from '../../lib';

function parseAmount(amount) {
    amount += "";
    var result = "";

    for (var i = 0; i < 18 - amount.length; i++) {
        result += '0';
    }
    result += amount;

    if (result.length === "18") {
        result = "0." + result;
    }
    else {
        result = result.substring(0, result.length - 18) + '.' + result.substring(result.length - 18);
    }

    return result.substring(0, result.length - 10);
}

const plainTextStyle = {
    color: "darkslategray",
    textDecoration: "none",
}

class BalanceRespList extends Component {

    listComponent(item) {
        if (!item) {
            return (
                <li key={key()}><p style={plainTextStyle}>{replace.zero}</p></li>
            )
        }

        return (
            <li key={key()}>
                <p id="short" onClick={() => this.props.history.push(`${page.currency.default}/${item[0]}`)}>{`[${item[0]}]`}</p>
                <p id="short" style={plainTextStyle}>{` ${parseAmount(item[1])}`}</p>
                <p id="full" onClick={() => this.props.history.push(`${page.currency.default}/${item[0]}`)}>{`[${item[0]}]`}</p>
                <p id="full" style={plainTextStyle}>{` ${item[1]}`}</p>
            </li>

        );
    }

    render() {
        const { items, onPrevClick, onNextClick, isLastPage, isFirstPage } = this.props;
        const titleStyle = {
            width: "100%", textAlign: "center",
            color: "black", textDecoration: "none",
            fontWeight: "400"
        };
        return (
            <div className="balance-list-resp-container">
                <ul>
                    <li style={{ backgroundColor: "transparent" }}>
                        <p id="full" style={titleStyle}>Currency - Balance</p>
                        <p id="short" style={titleStyle}>Currency - Balance (10<sup>10</sup>)</p>
                    </li>
                    {items.length > 0
                        ? items.map(x => this.listComponent(x))
                        : this.listComponent(null)}
                </ul>
                <section>
                    <button onClick={onPrevClick}
                        style={{ visibility: isFirstPage ? "hidden" : "visible" }}>{message.button.prev}</button>
                    <button onClick={onNextClick}
                        style={{ visibility: isLastPage ? "hidden" : "visible" }}>{message.button.next}</button>
                </section>
            </div>
        );
    }
}

export default BalanceRespList;