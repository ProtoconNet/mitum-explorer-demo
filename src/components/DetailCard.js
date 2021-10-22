import React, { Component } from 'react';
import './DetailCard.scss';

class DetailCard extends Component {
    listComponent(title, content) {

        const contentType = typeof (content);
        if (contentType === "string" || contentType === "number" || content === null) {
            return (
                <li id="main-li" key={title}>
                    <h3 id="main-title">{title}</h3>
                    <p id="main-content">{content ? content : "Not found"}</p>
                </li>
            );
        }
        else {
            return (
                <li id="main-li" key={title}>
                    <h3 id="main-title">{title}</h3>
                    <ul id="sub-ul">
                        {content.map(x => this.subListComponent(x[0], x[1]))}
                    </ul>
                </li>
            )
        }
    }

    subListComponent(title, content) {
        return (
            <li id="sub-li" key={title}>
                <p id="sub-title">{title}</p>
                <p id="sub-content">{content ? content : "-"}</p>
            </li>
        )
    }

    render() {
        const { items } = this.props;

        return (
            <ul id="main-ul">
                {items.map(item => this.listComponent(item[0], item[1]))}
            </ul>
        );
    }
}

export default DetailCard;