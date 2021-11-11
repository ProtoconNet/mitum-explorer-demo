import React, { Component } from "react";
import { connect } from "react-redux";

import './Operation.scss';

import Card from "../../components/views/Card";
import SearchBox from "../../components/SearchBox";
import DetailCard from "../../components/views/DetailCard";

import message from '../../lib/message.json';
import page, { operation as pageInfo } from '../../lib/page.json';
import { operation as operKeys } from '../../lib/keys.json';
import { getOperation, isAddress, isCurrency, isPublicKey, parseDate, parseDecimalFromAmount } from "../../lib";
import LoadingIcon from "../../components/LoadingIcon";
import DataView from "../../components/DataView";
import ActiveDetailCard from "../../components/views/ActiveDetailCard";

const initialState = {
    raw: "",
    factHash: "",
    operationHash: "",
    sender: "",
    type: "",
    items: [],
    keys: {},
    amounts: [],
    factSigns: [],
    date: "",
    height: 0,
    in_state: false,
    reason: "",
    isLoad: false,
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
                        ? operation.fact.amounts.map(x => ({ currency: x.currency, amount: parseDecimalFromAmount(x.amount) })) : [];

                    const sender = Object.prototype.hasOwnProperty.call(operation.fact, "sender") ? operation.fact.sender : null;
                    const factSigns = Object.prototype.hasOwnProperty.call(operation, "fact_signs") ? operation.fact_signs.map(
                        x => ({ signer: x.signer, signature: x.signature, signedAt: x.signed_at })
                    ) : null;

                    this.setState({
                        raw: JSON.stringify(data, null, 4),
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
                        factSigns,

                        sender,

                        isLoad: true,
                    });
                }
            )
            .catch(
                e => {
                    console.log(e)
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
        const { operationHash, type, confirm, factHash, height, in_state, reason, sender } = this.state;

        const infoItem = [[
            operKeys.title, [
                [operKeys.type, type],
                [operKeys.operhash, operationHash],
                [operKeys.fact.hash, factHash],
                sender ? [operKeys.sender, sender, [null, (x) => this.props.history.push(`${page.account.default}/${x}`)]] : null,
                [operKeys.confirm, confirm ? parseDate(confirm, true) : null],
                [operKeys.height, height, [null, height ? (x) => this.props.history.push(`${page.block.default}/${x}`) : null]],
                [operKeys.processed, in_state !== null && in_state !== undefined ? "" + in_state : null],
                !in_state ? [operKeys.reason, reason.msg] : null
            ]
        ]];

        return infoItem;
    }

    factSigns() {
        const { factSigns } = this.state;
        if (!factSigns) {
            return false;
        }
        return (
            <ActiveDetailCard
                title={operKeys.fact_signs.title}
                items={factSigns.map(
                    x => [x.signature, [
                        [operKeys.fact_signs.signer, x.signer],
                        [operKeys.fact_signs.signature, x.signature],
                        [operKeys.fact_signs.signed_at, x.signedAt]
                    ], null])}
                func={[null, [
                    [null, (x) => this.props.history.push(`${page.accounts.default}/${x}`)],
                    [null, null],
                    [null, null]
                ]]}
                isSpaceReverse={false} />
        )
    }

    detailKeys() {
        const { keys } = this.state;
        if (!keys || !Object.prototype.hasOwnProperty.call(keys, "keys") || !Object.prototype.hasOwnProperty.call(keys, "threshold")) {
            return false;
        }
        return (
            <ActiveDetailCard
                isShowActive={true}
                title={`${operKeys.fact.keys} (${operKeys.fact.threshold} : ${keys.threshold})`}
                items={keys.keys.map(x => [
                    x.key, [[`weight: ${x.weight}`, null]], null])}
                func={[(x) => this.props.history.push(`${page.accounts.default}/${x}`), [
                    [null, null]
                ]]}
                isSpaceReverse={false} />
        );
    }

    detailAmounts() {
        const { amounts } = this.state;
        if (!amounts || amounts.length < 1) {
            return false;
        }

        const items = amounts.map(
            x => [x.currency, `${x.amount} ${x.currency}`, [(x) => this.props.history.push(`${page.currency.default}/${x}`), null]])
        const amountsItems = [[operKeys.fact.amounts, items]];

        return <DetailCard keyIndex={null} items={amountsItems} />;

    }

    detailItems() {
        const { items } = this.state;
        var i;
        var maxLen = 0;

        if (!items || items.length < 1) {
            return false;
        }

        const detailItems = items.map(
            (x, idx) => {
                const item = [];
                if (Object.prototype.hasOwnProperty.call(x, "receiver")) {
                    item.push([operKeys.fact.receiver, x.receiver]);
                }
                if (Object.prototype.hasOwnProperty.call(x, "keys")) {
                    item.push([operKeys.fact.threshold, x.keys.threshold, true]);

                    const keys = x.keys.keys;
                    for (i = 0; i < keys.length; i++) {
                        item.push([`${operKeys.fact.key} ${i}`, `${keys[i].key} (${keys[i].weight})`, [null, keys[i].key]])
                    }
                }
                if (Object.prototype.hasOwnProperty.call(x, "amounts")) {
                    const amounts = x.amounts;
                    for (i = 0; i < amounts.length; i++) {
                        item.push([`${operKeys.fact.amount} ${i}`, `${parseDecimalFromAmount(amounts[i].amount)} ${amounts[i].currency}`, [null, amounts[i].currency]])
                    }
                }

                if (maxLen < item.length) {
                    maxLen = item.length;
                }

                return [`[${idx}] ` + this.parseType(x._hint), item, JSON.stringify(x, null, 4)];
            }
        )

        const func = [];
        for (i = 0; i < maxLen; i++) {
            func.push([null, (x) => this.parseRedirect(x)])
        }
        return (
            <ActiveDetailCard title={operKeys.items}
                items={detailItems}
                func={[null, func]}
                isSpaceReverse={false} />
        )
    }

    parseRedirect(target) {
        target = target.trim();
        const version = this.props.modelVersion;
        if (isAddress(target, version)) {
            this.props.history.push(`${page.account.default}/${target}`);
        }
        else if (isPublicKey(target, version)) {
            this.props.history.push(`${page.accounts.default}/${target}`);
        }
        else if (isCurrency(target)) {
            this.props.history.push(`${page.currency.default}/${target}`);
        }
    }

    render() {
        const infoItem = this.state.isLoad ? this.infoItem() : null;

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
                                {this.factSigns()}
                                {this.detailKeys()}
                                {this.detailAmounts()}
                                {this.detailItems()}
                                <DataView data={this.state.raw} />
                            </Card>
                        ) :
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