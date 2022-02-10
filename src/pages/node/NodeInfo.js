import React, { Component } from 'react';
import { connect } from 'react-redux';

import './NodeInfo.scss';

import Card from '../../components/views/Card';
import SearchBox from '../../components/SearchBox';
import DetailCard from '../../components/views/DetailCard';
import packageInfo from '../../../package.json';

import message from '../../lib/message.json';
import page from '../../lib/page.json';
import keys from '../../lib/keys.json';
import { isAddress, isPublicKey } from '../../lib';
import LoadingIcon from '../../components/LoadingIcon';

class NodeInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            blockHeight: 0,
            networkVersion: "",
        }
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    onSearch() {
        const search = this.state.search.trim();

        if (!search) {
            return;
        }

        if (isAddress(search)) {
            this.props.history.push(`${page.account.default}/${search}`);
        }
        else if(isPublicKey(search)) {
            this.props.history.push(`${page.accounts.default}/${search}`);
        }
        else {
            this.props.history.push(`${page.operation.default}/${search}`);
        }
    }

    render() {
        const items = [
            [keys.node.network, this.props.networkVersion],
            [keys.node.explorer, `v${packageInfo.version}`],
            [keys.node.height, this.props.blockHeight]
        ]

        const suffrages = this.props.suffrages.map(
            suffrage => ([suffrage.address, suffrage.url, [null, (x) => window.location.href = x]])
        );

        items.push([
            keys.node.suffrages, suffrages
        ])

        return (
            <div className="node-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder={message.placeholder.node}
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch()}
                        value={this.state.search} />
                </Card>
                <Card id="list" title="BlockCity Network Information">
                    {this.props.isLoad ? <DetailCard items={items} keyIndex={null} /> : <LoadingIcon />}
                </Card>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    modelVersion: state.info.modelVersion,
    networkVersion: state.info.networkVersion,
    blockHeight: state.info.blockHeight,
    suffrages: state.info.suffrages,
    isLoad: state.info.isLoad,
});

export default connect(
    mapStateToProps,
    null
)(NodeInfo);