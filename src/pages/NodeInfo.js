import React, { Component } from 'react';
import './NodeInfo.scss';
import Card from '../components/Card';
import SearchBox from '../components/SearchBox';

import packageInfo from '../../package.json';

import axios from 'axios';

class NodeInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            blockHeight: 0,
            networkVersion: "",
        }
    }

    async getNodeInfo() {
        return await axios.get(process.env.REACT_APP_NETWORK);
    }

    componentDidMount() {
        this.getNodeInfo()
            .then(
                res => {
                    const data = res.data._embedded;

                    this.setState({
                        networkVersion: data.version,
                        blockHeight: data.last_block.height
                    });
                }
            )
            .catch(
                e => {
                    console.log(e);
                }
            )
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    listComponent(title, content) {
        const listStyle = {
            marginBottom: "3rem",
        }
        
        const titleStyle = {
            fontSize: "0.9rem",
            fontWeight: "500",
            color: "#404040",
        }
        const fontStyle = {
            fontSize: "0.9rem",
            fontWeight: "350",
            color: "#404040",
        };

        return (
            <li style={listStyle}>
                <h3 style={titleStyle}>{title}</h3>
                <p style={fontStyle}>{content}</p>
            </li>
        );
    }

    render() {
        const listStyle = {
            width: "100%",
            margin: "0",
            padding: "1rem",
            listStyle: "none",
        }

        return (
            <div className="node-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter fact hash or account address"
                        onChange={(e) => this.onSearchChange(e)}
                        value={this.state.search} />
                </Card>
                <Card id="list" title="MITUM Network Information">
                    <ul style={listStyle}>
                        {this.listComponent("Network version", this.state.networkVersion)}
                        {this.listComponent("Explorer version", `v${packageInfo.version}`)}
                        {this.listComponent("Current block height", this.state.blockHeight)}
                    </ul>
                </Card>
            </div>
        );
    }
}

export default NodeInfo;