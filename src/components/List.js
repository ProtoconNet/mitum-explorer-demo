import React, { Component } from 'react';
import './List.scss';

const plainTextStyle = {
    color: "black",
    textDecoration: "none",
}

class List extends Component {

    listComponent(rowData, isAttribute) {

        if (isAttribute) {
            return (
                <li key={Math.random()} style={{ color: "black", backgroundColor: "transparent" }}>
                    {rowData.map(
                        x => (
                            <p style={{...plainTextStyle, fontWeight: "400"}}>{x}</p>
                        )
                    )}
                </li>
            );
        }
        else {
            const { onElementClick } = this.props;
            let i = 0;

            return (
                <li key={Math.random()}>
                    {rowData.map(
                        x => {
                            if(onElementClick[i] !== null ){
                                return <p onClick={() => onElementClick[i++](x)}>{x}</p>
                            }
                            else {
                                return <p style={plainTextStyle} >{x}</p>
                            }
                        }
                    )}
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