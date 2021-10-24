import React, { Component } from 'react';
import './List.scss';

const plainTextStyle = {
    color: "black",
    textDecoration: "none",
}

class List extends Component {

    contentComponent(content, func) {
        if (func === null) {
            return <p style={plainTextStyle}>{content}</p>
        }
        return <p onClick={() => func(content)}>{content}</p>
    }

    listComponent(rowData, isAttribute) {

        if (isAttribute) {
            return (
                <li key={Math.random()} style={{ color: "black", backgroundColor: "transparent" }}>
                    {rowData.map(
                        x => (
                            <p style={{ ...plainTextStyle, fontWeight: "400" }}>{x}</p>
                        )
                    )}
                </li>
            );
        }
        else {
            const { onElementClick } = this.props;
            const combinded = [];

            for (var i = 0; i < onElementClick.length; i++) {
                combinded.push([rowData[i], onElementClick[i]]);
            }

            return (
                <li key={Math.random()}>
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
                    {items.map(x => this.listComponent(x, false))}
                </ul>
                <section>
                    <button onClick={onPrevClick}
                        style={{ visibility: isFirstPage ? "hidden" : "visible" }}>PREV</button>
                    <button onClick={onNextClick}
                        style={{ visibility: isLastPage ? "hidden" : "visible" }}>NEXT</button>
                </section>
            </div>
        );
    }
}

export default List;