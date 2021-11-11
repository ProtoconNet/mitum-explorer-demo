import React, { Component } from 'react';
import page from '../../lib/page.json';
import message from '../../lib/message.json';
import './BalanceRespList.scss';
import { replace } from '../../lib/message.json';
import { key, parseDecimalFromAmount } from '../../lib';

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
                <p onClick={() => this.props.history.push(`${page.currency.default}/${item[0]}`)}>{item[0]}</p>
                <p style={plainTextStyle}>{`${parseDecimalFromAmount(item[1])}  ${item[0]}`}</p>
            </li>

        );
    }

    render() {
        const { items, onPrevClick, onNextClick, isLastPage, isFirstPage } = this.props;
        return (
            <div className="balance-list-resp-container">
                <ul>
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