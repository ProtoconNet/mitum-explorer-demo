import React, { Component } from 'react';
import message from '../../lib/message.json';
import { key } from '../../lib';
import './List.scss';

const plainTextStyle = {
    color: "black",
    textDecoration: "none",
}

const leftSide = "left";
const rightSide = "right";

class List extends Component {

    contentComponent(content, func, lonely) {
        const textStyle = {
            ...plainTextStyle,
        }

        if (lonely) {
            textStyle['width'] = "100%";
        }

        if (func === null) {
            if (content === null) {
                return (
                    <p style={{ ...textStyle, color: "gray" }}
                        key={key()}>{message.replace.zero}</p>
                );
            }
            return <p key={key()} style={textStyle}>{content}</p>
        }
        return <p key={key()} style={lonely ? { width: "100%" } : {}} onClick={() => func(content)}>{content}</p>
    }

    listComponent(rowData, isAttribute, lonely) {
        const side = !(this.props.side === leftSide || this.props.side === rightSide) ? "right" : "left";

        const textStyle = {
            ...plainTextStyle,
        }

        if (lonely) {
            textStyle['width'] = "100%";
        }

        if (isAttribute) {
            return (
                <li id={"list-" + side} key={key()} style={{ color: "black", backgroundColor: "transparent" }}>
                    {rowData.map(
                        x => (
                            <p key={key()} style={{ ...textStyle, fontWeight: "400" }}>{x}</p>
                        )
                    )}
                </li>
            );
        }
        else {
            const { onElementClick } = this.props;
            const combined = [];

            for (var i = 0; i < onElementClick.length; i++) {
                if (rowData[i] === null) {
                    combined.push([null, null]);
                }
                else {
                    combined.push([rowData[i], onElementClick[i]]);
                }
            }

            return (
                <li id={"list-" + side} key={key()}>
                    {
                        combined.map(x => this.contentComponent(x[0], x[1], lonely))
                    }
                </li>

            );
        }
    }

    render() {
        const { columns, items, onPrevClick, onNextClick, isLastPage, isFirstPage, isShow } = this.props;
        return (
            <div style={isShow ? {display: "block"} : {}} className="list-container">
                <ul>
                    {this.listComponent(columns, true, columns.length === 1)}
                    {items.length > 0
                        ? items.map(x => this.listComponent(x, false, columns.length === 1))
                        : this.listComponent(columns.map(x => null), false, columns.length === 1)}
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