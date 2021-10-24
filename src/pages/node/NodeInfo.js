import React, { Component } from 'react';
import { connect } from 'react-redux';
import './NodeInfo.scss';
import Card from '../../components/Card';
import SearchBox from '../../components/SearchBox';
import DetailCard from '../../components/DetailCard';
import packageInfo from '../../../package.json';

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
            ["Network version", this.props.networkVersion],
            ["Explorer version", `v${packageInfo.version}`],
            ["Current block height", this.props.blockHeight]
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

const mapStateToProps = state => ({
    networkVersion: state.info.networkVersion,
    blockHeight: state.info.blockHeight,
});

export default connect(
    mapStateToProps,
    null
)(NodeInfo);