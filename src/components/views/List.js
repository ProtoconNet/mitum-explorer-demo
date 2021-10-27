import React, { Component } from 'react';
import message from '../../lib/message.json';
import { key } from '../../lib';
import './List.scss';

const plainTextStyle = {
    color: "black",
    textDecoration: "none",
}

class List extends Component {

    contentComponent(content, func) {
        if (func === null) {
            if (content === null) {
                return (
                    <p style={{ ...plainTextStyle, color: "gray" }}
                        key={key()}>{message.replace.zero}</p>
                );
            }
            return <p key={key()} style={plainTextStyle}>{content}</p>
        }
        return <p key={key()} onClick={() => func(content)}>{content}</p>
    }

    listComponent(rowData, isAttribute) {

        if (isAttribute) {
            return (
                <li key={key()} style={{ color: "black", backgroundColor: "transparent" }}>
                    {rowData.map(
                        x => (
                            <p key={key()} style={{ ...plainTextStyle, fontWeight: "400" }}>{x}</p>
                        )
                    )}
                </li>
            );
        }
        else {
            const { onElementClick } = this.props;
            const combinded = [];

            for (var i = 0; i < onElementClick.length; i++) {
                if (rowData[i] === null) {
                    combinded.push([null, null]);
                }
                else {
                    combinded.push([rowData[i], onElementClick[i]]);
                }
            }

            return (
                <li key={key()}>
                    {
                        combinded.map(x => this.contentComponent(x[0], x[1]))
                    }
                </li>

            );
        }
    }

    render() {
        const { columns, items, onPrevClick, onNextClick, isLastPage, isFirstPage } = this.props;
        return (
            <div className="list-container">
                <ul>
                    {this.listComponent(columns, true)}
                    {items.length > 0
                        ? items.map(x => this.listComponent(x, false))
                        : this.listComponent(columns.map(x => null), false)}
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

export default List;