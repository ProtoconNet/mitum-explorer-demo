import React, { Component } from 'react';
import './List.scss';

class List extends Component {

    listComponent(rowData, isAttribute) {
        return (
            <li style={isAttribute ? { color: "black" } : {}}>
                {rowData.map(
                    x =>
                    (<p style={
                        isAttribute
                            ? { color: "black", textDecoration: "none" }
                            : {}
                    }>{x}</p>))}
            </li>
        )
    }

    render() {
        const { columns, list, onPrevClick, onNextClick, isLastPage, isFirstPage } = this.props;
        return (
            <div className="list-container">
                <ul>
                    {this.listComponent(columns, true)}
                    {list.map(x => this.listComponent(x, false))}
                </ul>
                <section>
                    <button onClick={onPrevClick}
                        style={{ visibility: isFirstPage ? "hidden" : "visible" }}>Prev page</button>
                    <button onClick={onNextClick}
                        style={{ visibility: isLastPage ? "hidden" : "visible" }}>Next page</button>
                </section>
            </div>
        );
    }
}

export default List;