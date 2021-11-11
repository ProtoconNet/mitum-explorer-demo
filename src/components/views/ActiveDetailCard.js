import React, { Component } from 'react';
import { key } from '../../lib';
import message, { button } from '../../lib/message.json';
import DataView from '../DataView';
import './ActiveDetailCard.scss';

const plainText = { textDecoration: "none", color: "black" };

class ActiveDetailCard extends Component {
    constructor(props) {
        super(props);

        const isOpen = [];
        for (var i = 0; i < this.props.items.length; i++) {
            isOpen.push(false);
        }

        this.state = {
            isOpen,
        }
    }


    listComponent(item, idx) {
        const { func } = this.props;

        return (
            <li id="outer-li" key={key()}>
                <section id="outer-main">
                    <p id="outer-text" style={func[0] ? {} : plainText} onClick={() => func[0] ? func[0](item[0]) : {}}>{item[0]}</p>
                    {!item[1]
                        ? false
                        : (
                            <button id="show-button" onClick={() => {
                                const isOpen = this.state.isOpen.map(
                                    (x, _) => {
                                        if( _ === idx) {
                                            return !x;
                                        }
                                        return x;
                                    }
                                );
                                this.setState({ isOpen, })
                            }}>
                                {this.state.isOpen[idx] ? button.up : button.down}
                            </button>
                        )
                    }
                </section>
                <section className="inner-container" style={this.state.isOpen[idx] ? {} : { display: "none" }}>
                    <ul id="inner-ul">
                        {item[1].map((x, __) => this.itemComponent(x, __))}
                    </ul>
                    {item[2] ? <DataView isSmall={true} data={item[2]} /> : false}
                </section>
            </li>
        );
    }

    itemComponent(item, idx) {
        const { func } = this.props;
        const { isSpaceReverse } = this.props;
        const firstSpaceStyle = isSpaceReverse ? { width: "70%" } : {};
        const secondSpaceStyle = isSpaceReverse ? { width: "30%" } : {};

        const firstFuncTarget = item.length > 2 && Array.isArray(item[2]) && item[2][0] ? item[2][0] : item[0];
        const secondeFuncTarget = item.length > 2 && Array.isArray(item[2]) && item[2][1] ? item[2][1] : item[1];

        if (item.length > 2 && typeof item[2] === "boolean" && item[2]) {
            firstSpaceStyle['color'] = "black";
            secondSpaceStyle['color'] = "black";
        }

        return (
            <li id="inner-li" key={key()}>
                <p id="inner-text" style={func[1][idx][0] ? firstSpaceStyle : { ...plainText, ...firstSpaceStyle }}
                    onClick={() => func[1][idx][0] ? func[1][idx][0](firstFuncTarget) : {}}>{item[0]}</p>
                <p id="inner-text" style={func[1][idx][1] ? secondSpaceStyle : { ...plainText, ...secondSpaceStyle }}
                    onClick={() => func[1][idx][1] ? func[1][idx][1](secondeFuncTarget) : {}}>{item[1]}</p>
            </li>
        )
    }

    render() {
        const { title, items, func } = this.props;

        if (!items || !func || items === null || func === null || items.length < 1) {
            return <section className="active-detail-card-container">
                <h3 id="title">{title}</h3>
                <p id="error">{message.replace.null}</p>
            </section>
        }

        return (
            <section className="active-detail-card-container">
                <h3 id="title">{title}</h3>
                <ul id="outer-ul">
                    {items.map((item, idx) => item ? this.listComponent(item, idx) : false)}
                </ul>
            </section>
        );
    }
}


export default ActiveDetailCard;