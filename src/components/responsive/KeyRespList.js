import React, { Component } from 'react';
import page from '../../lib/page.json';
import message from '../../lib/message.json';
import './KeyRespList.scss';
import { replace } from '../../lib/message.json';
import { key } from '../../lib';

const plainTextStyle = {
    color: "darkslategray",
    textDecoration: "none",
}

class KeyRespList extends Component {

    listComponent(item) {
        if(!item) {
            return (
                <li key={key()}><p style={plainTextStyle}>{replace.zero}</p></li>
            )
        }

        return (
            <li key={key()}>
                <p id="short" onClick={() => this.props.history.push(`${page.accounts.default}/${item[0]}`)}>{`${item[0].substring(0, 35)}...(${item[1]})`}</p>
                <p id="full" onClick={() => this.props.history.push(`${page.accounts.default}/${item[0]}`)}>{`${item[0]} (${item[1]})`}</p>
            </li>

        );
    }

    render() {
        const { items, onPrevClick, onNextClick, isLastPage, isFirstPage } = this.props;
        return (
            <div className="key-list-resp-container">
                <ul>
                    <li style={{ backgroundColor: "transparent" }}>
                        <p style={{ 
                            width: "100%", textAlign: "center", 
                            color: "black", textDecoration: "none",
                            fontWeight: "400"
                        }}>Public Key (Weight)</p>
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

export default KeyRespList;