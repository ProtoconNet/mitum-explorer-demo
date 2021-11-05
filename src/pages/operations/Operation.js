import React, { Component } from "react";
import { connect } from "react-redux";

import './Operation.scss';

import Card from "../../components/views/Card";
import SearchBox from "../../components/SearchBox";
import DetailCard from "../../components/views/DetailCard";

import message from '../../lib/message.json';
import page, { operation as pageInfo } from '../../lib/page.json';
import { operation as operKeys, keys as keysKeys, amounts as amountsKeys } from '../../lib/keys.json';
import { getOperation, isAddress, parseDate } from "../../lib";
import LoadingIcon from "../../components/LoadingIcon";

const initialState = {
    factHash: "",
    operationHash: "",
    sender: "",
    type: "",
    items: [],
    keys: {},
    amounts: [],
    date: "",
    height: 0,
    in_state: false,
    reason: "",
    isLoad: false,
}

const plainTitleStyle = {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#404040",
    padding: "0",
    margin: "0",
    width: "100%",
    textAlign: "start"
}

class Operation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            ...initialState,
        }
    }

    parseType(_hint) {
        const idx = _hint.indexOf(`-${this.props.modelVersion}`);
        if (idx < 0) {
            return message.replace.unknown;
        }
        return _hint.substring(0, idx);
    }

    loadOperation(hash) {

        getOperation(this.props.api, hash)
            .then(
                res => {
                    const data = res.data._embedded;
                    const { operation } = data;

                    const items = Object.prototype.hasOwnProperty.call(operation.fact, "items") ? operation.fact.items.map(x => x) : [];
                    const keys = Object.prototype.hasOwnProperty.call(operation.fact, "keys") ? operation.fact.keys : {};
                    const amounts = Object.prototype.hasOwnProperty.call(operation.fact, "amounts")
                        ? operation.fact.amounts.map(x => ({ currency: x.currency, amount: x.amount })) : [];

                    const sender = Object.prototype.hasOwnProperty.call(operation.fact, "sender") ? operation.fact.sender : null;

                    this.setState({
                        raw: JSON.stringify(operation, null, 4),
                        operationHash: operation.hash,
                        factHash: operation.fact.hash,
                        type: this.parseType(operation._hint),
                        items,
                        keys,
                        amounts,
                        confirm: data.confirmed_at,
                        height: data.height,
                        in_state: data.in_state,
                        reason: data.reason,

                        sender,

                        isLoad: true,
                    });
                }
            )
            .catch(
                e => {
                    this.setState({
                        ...initialState,
                        isLoad: true
                    })
                }
            )
    }

    componentDidMount() {
        const { params } = this.props.match;
        if (Object.prototype.hasOwnProperty.call(params, pageInfo.key)) {
            this.loadOperation(params.hash);
        }
        else {
            this.props.history.push(page.operations.default);
        }
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    onSearch() {
        const search = this.state.search.trim();
        const version = this.props.modelVersion;

        if (!search) {
            return;
        }

        if (isAddress(search, version)) {
            this.props.history.push(`${page.account.default}/${search}`);
        }
        else {
            this.props.history.push(`${page.operation.default}/${search}`);
            window.location.reload();
        }
    }

    infoItem() {
        const { operationHash, factHash, type, confirm, height, in_state, reason, sender } = this.state;

        const infoItem = [[
            operKeys.title, [
                [operKeys.type, type],
                [operKeys.operhash, operationHash],
                [operKeys.hash, factHash],
                sender ? [operKeys.sender, sender, [null, (x) => this.props.history.push(`${page.account.default}/${x}`)]] : null,
                [operKeys.confirm, parseDate(confirm, true)],
                [operKeys.height, height, [null, (x) => this.props.history.push(`${page.block.default}/${x}`)]],
                [operKeys.processed, "" + in_state],
                !in_state ? [operKeys.reason, reason.msg] : null
            ]
        ]];

        return infoItem;
    }


    detailItem() {
        const { items, keys, amounts } = this.state;
        const detailInfo = [];
        var keyIndex = null;

        if (Object.keys(keys).length > 0) {
            detailInfo.push([keysKeys.keys,
            [[keysKeys.threshold, keys.threshold]].concat(
                keys.keys.map(
                    key => [key.key, key.weight, [(x) => this.props.history.push(`${page.accounts.default}/${x}`), null]]
                ))
            ]);

            keyIndex = detailInfo.length - 1;
        }
        if (amounts.length > 0) {
            detailInfo.push([amountsKeys.amounts,
            amounts.map(amount => [amount.currency, amount.amount, [(x) => this.props.history.push(`${page.currency.default}/${x}`), null]])
            ]);
        }
        if (items.length > 0) {
            detailInfo.push([operKeys.items,
            items.map(
                (item, idx) => [idx, this.parseType(item._hint), JSON.stringify(item, null, 4)]),
            ]);
        }

        return {
            keyIndex,
            item: detailInfo,
        }
    }

    render() {
        const infoItem = this.state.isLoad ? this.infoItem() : null;
        const detailItem = this.state.isLoad ? this.detailItem() : null;

        return (
            <div className="operation-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder={message.placeholder.operation}
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch()}
                        value={this.state.search} />
                </Card>
                {
                    this.state.isLoad
                        ? (
                            <Card title="Operation Information">
                                <DetailCard keyIndex={null} items={infoItem} />
                                <p style={plainTitleStyle}>Details</p>
                                <DetailCard keyIndex={detailItem.keyIndex} items={detailItem.item}/>
                            </Card>
                        ):
                        (
                            <Card title="Operation Information">
                                <LoadingIcon />
                            </Card>
                        )
                }
            </div>
        )
    }
}

const mapStateToProps = state => ({
    modelVersion: state.info.modelVersion,
    api: state.network.api,
});

export default connect(
    mapStateToProps,
    null
)(Operation);