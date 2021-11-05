import React, { Component } from 'react';
import page from '../../lib/page.json';
import message from '../../lib/message.json';
import './BlockRespList.scss';
import { replace } from '../../lib/message.json';
import { key } from '../../lib';

const plainTextStyle = {
    color: "darkslategray",
    textDecoration: "none",
}

class BlockRespList extends Component {

    listComponent(item) {
        if (!item) {
            return (
                <li key={key()}><p id="block-list-resp-content" style={plainTextStyle}>{replace.zero}</p></li>
            )
        }

        return (
            <li key={key()}>
                <p id="block-list-resp-content" style={plainTextStyle}>{`${item[2]} `}</p>
                <p id="block-list-resp-content" onClick={() => {this.props.history.push(`${page.block.default}/${item[0]}`); window.location.reload(); }}>{item[0]}</p>
            </li>

        );
    }

    render() {
        const { items, onPrevClick, onNextClick, isLastPage, isFirstPage } = this.props;

        return (
            <div className="block-list-resp-container">
                <ul>
                    <li style={{ backgroundColor: "transparent" }}>
                        <p id="block-list-resp-title" style={{
                            width: "100%", textAlign: "center",
                            color: "black", textDecoration: "none",
                            fontWeight: "400",
                        }}>Blocks</p>
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

export default BlockRespList;