import React, { Component } from 'react';
import './ActiveContent.scss';
import message from '../../lib/message.json';
import { key } from '../../lib';

class ActiveContent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showSubContent: false,
        }
    }

    render() {
        const { item } = this.props;
        const { showSubContent } = this.state;

        const title = item[0];
        const content = item[1];

        const titleFunc = item.length >= 3 && item[2] && Array.isArray(item[2]) && item[2][0] ? item[2][0] : null;
        const contentFunc = item.length >= 3 && item[2] && Array.isArray(item[2]) && item[2][1] ? item[2][1] : null;

        const isSubContentExist = item.length >= 3 && item[2] && typeof item[2] === "string";

        const isTitleImportant = this.props.isTitleImportant;
        const titleStyle = isTitleImportant ? { width: "70%" } : {};
        const contentStyle = isTitleImportant ? { width: "30%" } : {};

        if (isSubContentExist) {
            return (
                <li className="sub-active background" id="sub-li" key={key()} onClick={(() => this.setState({ showSubContent: !showSubContent }))}>
                    <section id="sub-section" style={{ margin: "0", padding: "0", width: "100%", height: "fit-content" }} key={key()}>
                        <p style={titleStyle} id="sub-title" key={key()}>{title}</p>
                        <p style={contentStyle} id="sub-content" key={key()}>{content ? content : message.replace.empty}</p>
                    </section>
                    {
                        showSubContent
                            ? (
                                <pre style={{ textDecoration: "none" }} key={key()}>
                                    {item[2]}
                                </pre>
                            )
                            : false
                    }
                </li>
            );
        }

        return (
            <li className="inactive" id="sub-li" key={key()}>
                <p style={titleStyle} className={titleFunc ? "active" : null} id="sub-title" key={key()}
                    onClick={() => titleFunc ? titleFunc(title) : {}}>{title}</p>
                <p style={contentStyle} className={contentFunc ? "active" : null} id="sub-content" key={key()}
                    onClick={() => contentFunc ? contentFunc(content) : {}}>{content ? content : message.replace.empty}</p>
            </li>
        );
    }
}

export default ActiveContent;