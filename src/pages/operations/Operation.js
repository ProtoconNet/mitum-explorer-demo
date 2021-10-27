import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";

import './Operation.scss';

import Card from "../../components/views/Card";
import SearchBox from "../../components/SearchBox";
import DetailCard from "../../components/views/DetailCard";

import page, { operation as pageInfo } from '../../lib/page.json';
import { operation as operKeys, keys as keysKeys, amounts as amountsKeys } from '../../lib/keys.json';
import { isAddress, link, parseDate, urls } from "../../lib";
import LoadingIcon from "../../components/LoadingIcon";

const getOperation = async (hash) => {
    return await axios.get(link(urls.operation + hash));
}

const initialState = {
    factHash: "",
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
            return "Unknown";
        }
        return _hint.substring(0, idx);
    }

    loadOperation(hash) {

        getOperation(hash)
            .then(
                res => {
                    const data = res.data._embedded;
                    const { operation } = data;

                    const items = Object.prototype.hasOwnProperty.call(operation.fact, "items") ? operation.fact.items.map(x => x) : [];
                    const keys = Object.prototype.hasOwnProperty.call(operation.fact, "keys") ? operation.fact.keys : {};
                    const amounts = Object.prototype.hasOwnProperty.call(operation.fact, "amounts")
                        ? operation.fact.amounts.map(x => ({ currency: x.currency, amount: x.amount })) : [];

                    this.setState({
                        factHash: operation.fact.hash,
                        type: this.parseType(operation._hint),
                        items,
                        keys,
                        amounts,
                        date: data.confirmed_at,
                        height: data.height,
                        in_state: data.in_state,
                        reason: data.reason,
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
        const { factHash, type, items, keys, amounts, date, height, in_state, reason } = this.state;
        const infoItem = [
            [operKeys.hash, factHash],
            [operKeys.type, type],
            [operKeys.date, parseDate(date)],
            [operKeys.height, height, [null, (x) => this.props.history.push(`${page.block.default}/${x}`)]],
            [operKeys.processed, "" + in_state],
            !in_state ? [operKeys.reason, reason] : null,
        ];

        if (items.length > 0) {
            infoItem.push([operKeys.items,
            items.map(
                (item, idx) => [idx, this.parseType(item._hint), JSON.stringify(item, null, 4)]),
            ]);
        }
        if (Object.keys(keys).length !== 0) {
            infoItem.push([keysKeys.keys,
            [[keysKeys.threshold, keys.threshold]].concat(
                keys.keys.map(
                    key => [key.key, key.weight, [(x) => this.props.history.push(`${page.accounts.default}/${x}`), null]]
                ))
            ]);
        }
        if (amounts.length > 0) {
            infoItem.push([amountsKeys.amounts,
            amounts.map(amount => [amount.currency, amount.amount, [(x) => this.props.history.push(`${page.currency.default}/${x}`), null]])
            ]);
        }

        return infoItem;
    }

    render() {

        return (
            <div className="operation-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter fact hash or account address"
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch()}
                        value={this.state.search} />
                </Card>
                <Card id="list" title="Operation Information">
                    {this.state.isLoad ? <DetailCard items={this.infoItem()} /> : <LoadingIcon />}
                </Card>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    modelVersion: state.info.modelVersion,
});

export default connect(
    mapStateToProps,
    null
)(Operation);