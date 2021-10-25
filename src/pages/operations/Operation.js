import React, { Component } from "react";
import './Operation.scss';
import Card from "../../components/Card";
import SearchBox from "../../components/SearchBox";
import axios from "axios";
import { connect } from "react-redux";
import DetailCard from "../../components/DetailCard";

const network = process.env.REACT_APP_NETWORK;
const operationApi = process.env.REACT_APP_OPERATION;

const getOperation = async (hash) => {
    return await axios.get(network + operationApi + hash);
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
                        ? operation.fact.amounts.map(x => ({ currency: x.currency, amount: x.amount})) : [];

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
                    });
                }
            )
            .catch(
                e => {
                    this.setState({
                        ...initialState
                    })
                }
            )
    }

    componentDidMount() {
        const { params } = this.props.match;
        if (Object.prototype.hasOwnProperty.call(params, "hash")) {
            this.loadOperation(params.hash);
        }
        else {
            this.props.history.push('/operations');
        }
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    isAddress(target) {
        const { modelVersion } = this.props;

        if (target.indexOf(":mca-" + modelVersion) > -1) {
            return true;
        }
        return false;
    }

    onSearch() {
        const { search } = this.state;

        if (!search) {
            return;
        }

        if (this.isAddress(search)) {
            this.props.history.push(`/account/${search}`);
        }
        else {
            this.props.history.push(`/operation/${search}`);
            window.location.reload();
        }
    }

    render() {
        const { factHash, type, items, keys, amounts, date, height, in_state, reason } = this.state;
        const infoItem = [
            ["Fact hash", factHash],
            ["Operation type", type],
            ["Date", date],
            ["Block height", height],
            ["In state", "" + in_state],
            !in_state ? ["Reason", reason] : null,
        ];

        if (items.length > 0) {
            infoItem.push(["Items",
                items.map((item, idx) => [idx, this.parseType(item._hint)]),
            ]);
        }
        if (Object.keys(keys).length !== 0) {
            infoItem.push(["Keys",
                [["Threshold", keys.threshold]].concat(keys.keys.map(key => [key.key, key.weight]))
            ]);
        }
        if (amounts.length > 0) {

            infoItem.push(["Amounts",
                amounts.map(amount => [amount.currency, amount.amount])
            ]);
        }

        return (
            <div className="operation-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter fact hash or account address"
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch}
                        value={this.state.search} />
                </Card>
                <Card id="list" title="Operation Information">
                    <DetailCard items={infoItem} />
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