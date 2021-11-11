import React, { Component } from 'react';
import page from '../../lib/page.json';
import message from '../../lib/message.json';
import './OperationRespList.scss';
import { replace } from '../../lib/message.json';
import { key } from '../../lib';

const plainTextStyle = {
    color: "darkslategray",
    textDecoration: "none",
}

class OperationRespList extends Component {

    listComponent(item) {
        if (!item) {
            return (
                <li key={key()}><p id="operation-list-resp-content" style={plainTextStyle}>{replace.zero}</p></li>
            )
        }

        return (
            <li key={key()}>
                <p id="operation-list-resp-content" style={plainTextStyle}>{`${item[1]} `}</p>
                <p id="operation-list-resp-content" onClick={() => this.props.history.push(`${page.operation.default}/${item[0]}`)}>{item[0]}</p>
            </li>
        );
    }

    render() {
        const { items, onPrevClick, onNextClick, isLastPage, isFirstPage } = this.props;

        return (
            <div className="operation-list-resp-container">
                <ul>
                    <li style={{ backgroundColor: "transparent" }}>
                        <p id="operation-list-resp-title" style={{
                            width: "100%", textAlign: "center",
                            color: "black", textDecoration: "none",
                            fontWeight: "400",
                        }}>Operations</p>
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

export default OperationRespList;