import React, { Component } from "react";
import { connect } from 'react-redux';
import './Accounts.scss';
import Card from "../../components/Card";
import SearchBox from "../../components/SearchBox";
import List from "../../components/List";

import axios from "axios";
import DetailCard from "../../components/DetailCard";

const network = process.env.REACT_APP_NETWORK;
const accountApi = process.env.REACT_APP_ACCOUNT;
const operationsApi = process.env.REACT_APP_ACCOUNT_OPERATIONS;

const publicKeysColumns = ["Public key", "Weight"];
const operationsColumns = ["Fact hash", "Date", "Items"];
const BalancesColumns = ["Currency ID", "Amount"];

const getAccount = async (address) => {
    return axios.get(network + accountApi + address);
}

const getAccountOperation = async (address) => {
    return axios.get(network + accountApi + address + operationsApi);
}

const checkNextLink = async (next) => {
    return axios.get(network + next);
}

const initialState = {
    result: {
        address: null,
        keys: {
            threshold: -1,
            keys: [],
        },
        balances: [],
        operations: [],
    },
    keysIdx: 0,
    balancesIdx: 0,
    operationsIdx: 0,
    operationsStack: [],
}

class Account extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            searchRes: initialState,
        }
    }

    loadAccountInfo(address) {
        getAccount(address)
            .then(
                res => {
                    const data = res.data._embedded;

                    this.setState({
                        isLoad: true,
                        searchRes: {
                            ...this.state.searchRes,
                            result: {
                                ...this.state.searchRes.result,
                                address: data.address,
                                keys: {
                                    threshold: data.keys.threshold,
                                    keys: data.keys.keys.map(
                                        key => ({
                                            key: key.key,
                                            weight: key.weight,
                                        })
                                    ),
                                },
                                balances: data.balance.map(
                                    balance => ({
                                        currency: balance.currency,
                                        amount: balance.amount,
                                    })
                                ),
                            },
                            keysIdx: 0,
                            balancesIdx: 0,
                        }
                    });
                }
            )
            .catch(
                e => {
                    this.setState({
                        searchRes: initialState,
                    });
                }
            )

        getAccountOperation(address)
            .then(
                res => {
                    const operations = res.data._embedded;
                    const { self, next } = res.data._links;
                    const nextState = {
                        searchRes: {
                            ...this.state.searchRes,
                            result: {
                                ...this.state.searchRes.result,
                                operations: operations.map(
                                    operation => ({
                                        factHash: operation._embedded.operation.fact.hash,
                                        date: operation._embedded.confirmed_at,
                                        items: operation._embedded.operation.fact.items.length,
                                    })
                                )
                            },
                            operationsIdx: 0,
                        }
                    }

                    checkNextLink(next.href)
                        .then(
                            res => {
                                this.setState({
                                    ...nextState,
                                    operationsStack: [self.href, next.href],
                                })
                            }
                        )
                        .catch(
                            e => {
                                this.setState({
                                    ...nextState,
                                    operationsStack: [self.href],
                                })
                            }
                        )

                }
            )
            .catch(
                e => {
                    this.setState({
                        searchRes: initialState,
                    });
                }
            )
    }

    componentDidMount() {
        const { params } = this.props.match;
        if (Object.prototype.hasOwnProperty.call(params, "address")) {
            this.loadAccountInfo(params.address);
        }
        else {
            this.loadAccountInfo(process.env.REACT_APP_GENESIS_ACCOUNT);
        }
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    onSearch() {
        if (this.state.search === "") {
            return;
        }

        if (this.isAddress(this.state.search)) {
            this.props.history.push(`/account/${this.state.search}`)
        }
        else {
            this.props.history.push(`/accounts/${this.state.search}`);
        }
    }

    onPubPrev() {

    }

    onPubNext() {

    }

    onBalancePrev() {

    }

    onBalanceNext() {

    }

    onOperationPrev() {

    }

    onOperationNext() {

    }

    isAddress(target) {
        const { version } = this.props;

        if (target.indexOf(":mca-" + version) > -1) {
            return true;
        }
        return false;
    }

    renderAccountInfo() {
        const { searchRes } = this.state;

        if (!searchRes.result.address) {
            return (
                <Card id="account-info" title="Account Information">
                    <p>Not found</p>
                </Card>
            )
        }

        const { keysIdx, balancesIdx } = searchRes;
        const { keys } = searchRes.result.keys;
        const { balances } = searchRes.result;

        const pubItems = keys
            .map(key => [key.key, key.weight])
            .slice(keysIdx, (keysIdx + 10 >= keys.length ? keys.length : keysIdx + 10))
        const balalncesItems = balances
            .map(currency => [currency.currency, currency.amount])
            .slice(balancesIdx, (balancesIdx + 10 >= balances.length ? balances.length : balancesIdx + 10))

        const plainTitleStyle = {
            fontSize: "0.9rem",
            fontWeight: "500",
            color: "#404040",
            padding: "0",
            margin: "0",
            width: "100%",
            textAlign: "start"
        }

        return (
            <Card id="account-info" title="Account Information">
                <DetailCard items={[
                    ["Address", searchRes.result.address],
                    ["Threshold", searchRes.result.keys.threshold]
                ]} />

                <p style={plainTitleStyle}>Keys</p>
                <List columns={publicKeysColumns}
                    items={pubItems}
                    onElementClick={[null, null]}
                    onPrevClick={() => this.onPubPrev()}
                    onNextClick={() => this.onPubNext()}
                    isFirstPage={keysIdx === 0}
                    isLastPage={keysIdx + 10 >= keys.length} />

                <p style={plainTitleStyle}>Balances</p>
                <List columns={BalancesColumns}
                    items={balalncesItems}
                    onElementClick={[null, null]}
                    onPrevClick={() => this.onBalancePrev()}
                    onNextClick={() => this.onBalanceNext()}
                    isFirstPage={balancesIdx === 0}
                    isLastPage={balancesIdx + 10 >= balances.length} />
            </Card>
        );
    }

    renderOperations() {
        const { searchRes } = this.state;
        const { operationsIdx, operationsStack } = searchRes;
        const { operations } = searchRes.result;

        if (!operations) {
            return (
                <Card id="operations" title="Operations">
                    <p>Not found</p>
                </Card>
            )
        }

        const operationItems = operations
            .map(operation => [operation.factHash, operation.date, operation.items]);

        return (
            <Card id="operations" title="Operations">
                <List columns={operationsColumns}
                    items={operationItems}
                    onElementClick={[null, null]}
                    onPrevClick={() => this.onOperationPrev()}
                    onNextClick={() => this.onOperationNext()}
                    isFirstPage={operationsIdx === 0}
                    isLastPage={operationsIdx + 1 >= operationsStack.length} />
            </Card>
        );
    }

    render() {
        const state = this.state;
        return (
            <div className="accounts-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter account address or public key"
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch()}
                        value={state.search} />
                </Card>
                {this.renderAccountInfo()}
                {this.renderOperations()}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    version: state.version.version,
});

export default connect(
    mapStateToProps,
    null
)(Account);