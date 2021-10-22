import React, { Component } from 'react';
import { connect } from 'react-redux';
import './NodeInfo.scss';
import Card from '../../components/Card';
import SearchBox from '../../components/SearchBox';

import packageInfo from '../../../package.json';

import axios from 'axios';
import DetailCard from '../../components/DetailCard';
import { setVersion } from '../../store/actions';

const getNodeInfo = async () => {
    return await axios.get(process.env.REACT_APP_NETWORK);
}

class NodeInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            blockHeight: 0,
            networkVersion: "",
        }
    }

    load() {
        getNodeInfo()
        .then(
            res => {
                const data = res.data._embedded;
                
                const version = res.data._hint.slice("mitum-currency-hal-".length, -1);
                this.props.setVersion(version);

                this.setState({
                    networkVersion: data.version,
                    blockHeight: data.last_block.height
                });
            }
        )
        .catch(
            e => {
                this.setState({
                    networkVersion: "Not found",
                    blockHeight: "Not found"
                });
            }
        )
    }

    componentDidMount() {
        this.load();
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    render() {
        const items = [
            ["Network version", this.state.networkVersion],
            ["Explorer version", `v${packageInfo.version}`],
            ["Current block height", this.state.blockHeight]
        ]

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
                    <DetailCard
                        items={items} />
                </Card>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    setVersion: (version) => dispatch(setVersion(version)),
});

export default connect(
    null,
    mapDispatchToProps
)(NodeInfo);