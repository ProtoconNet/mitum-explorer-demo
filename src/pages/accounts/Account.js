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
const operationsApi = process.env.REACT_APP_OPERATIONS;

const publicKeysColumns = ["Public key", "Weight"];
const operationsColumns = ["Fact hash", "Date", "Items"];
const BalancesColumns = ["Currency ID", "Amount"];

const getAccount = async (address) => {
    return await axios.get(network + accountApi + address);
}

const getAccountOperation = async (address) => {
    return await axios.get(network + accountApi + address + operationsApi);
}

const checkNextLink = async (next) => {
    return await axios.get(network + next);
}

const initialState = {
    keysRes: {
        idx: 0,
        keys: [],
        threshold: -1,
    },
    balancesRes: {
        idx: 0,
        balances: [],
    },
    operationsRes: {
        idx: 0,
        linkStack: [],
        operations: [],
    },
    addressRes: null,
}

class Account extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            ...initialState,
        }
    }

    loadAccountInfo(address) {
        getAccount(address)
            .then(
                res => {
                    const data = res.data._embedded;

                    this.setState({
                        addressRes: data.address,
                        keysRes: {
                            threshold: data.keys.threshold,
                            keys: data.keys.keys.map(
                                key => ({
                                    key: key.key,
                                    weight: key.weight,
                                })
                            ),
                            idx: 0,
                        },
                        balancesRes: {
                            balances: data.balance.map(
                                balance => ({
                                    currency: balance.currency,
                                    amount: balance.amount,
                                })
                            ),
                            idx: 0,
                        }
                    });
                }
            )
            .catch(
                e => {
                    this.setState({
                        ...initialState,
                    });
                }
            )

        getAccountOperation(address)
            .then(
                res => {
                    const operations = res.data._embedded;
                    const { self, next } = res.data._links;
                    const nextState = {
                        operations: operations.map(
                            operation => ({
                                factHash: operation._embedded.operation.fact.hash,
                                date: operation._embedded.confirmed_at,
                                items: Object.prototype.hasOwnProperty.call(operation._embedded.operation.fact, "items")
                                    ? operation._embedded.operation.fact.items.length
                                    : 0
                            })
                        ),
                        idx: 0,
                    }

                    checkNextLink(next.href)
                        .then(
                            res => {
                                this.setState({
                                    operationsRes: {
                                        ...nextState,
                                        linkStack: [self.href, next.href],
                                    }
                                })
                            }
                        )
                        .catch(
                            e => {
                                this.setState({
                                    operationsRes: {
                                        ...nextState,
                                        linkStack: [self.href],
                                    }
                                })
                            }
                        )

                }
            )
            .catch(
                e => {
                    this.setState({
                        ...initialState,
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
            this.props.history.push(`/accounts`);
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
            this.props.history.push(`/account/${this.state.search}`);
            window.location.reload();
        }
        else {
            this.props.history.push(`/accounts/${this.state.search}`);
        }
    }

    onPubPrev() {
        const { idx } = this.state.keysRes;
        this.setState({
            keysRes: {
                ...this.state.keysRes,
                idx: idx - 3 < 0 ? 0 : idx - 3
            }
        });
    }

    onPubNext() {
        const { idx, keys } = this.state.keysRes;
        this.setState({
            keysRes: {
                ...this.state.keysRes,
                idx: idx + 3 > keys.length ? idx : idx + 3,
            }
        })
    }

    onBalancePrev() {
        const { idx } = this.state.balancesRes;
        this.setState({
            balancesRes: {
                ...this.state.balancesRes,
                idx: idx - 3 <= 0 ? 0 : idx - 3,
            }
        });
    }

    onBalanceNext() {
        const { idx, balances } = this.state.balancesRes;
        this.setState({
            balancesRes: {
                ...this.state.balancesRes,
                idx: idx + 3 > balances.length ? idx : idx + 3,
            }
        });
    }

    onOperationPrev() {
        const { idx, linkStack } = this.state.operationsRes;

        if (idx <= 0) {
            return;
        }
        else {
            checkNextLink(linkStack[idx - 1])
                .then(
                    res => {
                        const operations = res.data._embedded;

                        this.setState({
                            operationsRes: {
                                ...this.state.operationsRes,
                                operations: operations.map(
                                    operation => ({
                                        factHash: operation._embedded.operation.fact.hash,
                                        date: operation._embedded.confirmed_at,
                                        items: Object.prototype.hasOwnProperty.call(operation._embedded.operation.fact, "items")
                                            ? operation._embedded.operation.fact.items.length
                                            : 0
                                    })
                                ),
                                idx: idx - 1,
                            }
                        });
                    }
                )
                .catch(
                    e => alert("Network error!")
                )
        }
    }

    onOperationNext() {
        const { idx, linkStack } = this.state.operationsRes;

        if (idx + 1 >= linkStack.length) {
            return;
        }
        else {
            checkNextLink(linkStack[idx + 1])
                .then(
                    res => {
                        const operations = res.data._embedded;
                        const nextState = {
                            ...this.state.operationsRes,
                            operations: operations.map(
                                operation => ({
                                    factHash: operation._embedded.operation.fact.hash,
                                    date: operation._embedded.confirmed_at,
                                    items: Object.prototype.hasOwnProperty.call(operation._embedded.operation.fact, "items")
                                        ? operation._embedded.operation.fact.items.length
                                        : 0
                                })
                            ),
                            idx: idx + 1,
                        }

                        if (idx + 2 >= linkStack.length) {
                            const { next } = res.data._links;
                            checkNextLink(next.href)
                                .then(
                                    nextRes => {
                                        this.setState({
                                            operationsRes: {
                                                ...nextState,
                                                linkStack: linkStack.concat([next.href]),
                                            }
                                        })
                                    }
                                )
                                .catch(
                                    e => {
                                        this.setState({
                                            operationsRes: {
                                                ...nextState,
                                            }
                                        })
                                    }
                                )
                        }
                    }
                )
                .catch(
                    e => alert("Network error!")
                )
        }

    }

    isAddress(target) {
        const { modelVersion } = this.props;

        if (target.indexOf(":mca-" + modelVersion) > -1) {
            return true;
        }
        return false;
    }

    renderAccountInfo() {
        const { addressRes, balancesRes, keysRes } = this.state;

        if (!addressRes) {
            return (
                <Card id="account-info" title="Account Information">
                    <p>Not found</p>
                </Card>
            )
        }

        const { keys } = keysRes;
        const { balances } = balancesRes;

        const pubItems = keys
            .map(key => [key.key, key.weight])
            .slice(keysRes.idx, (keysRes.idx + 3 >= keys.length ? keys.length : keysRes.idx + 3))
        const balancesItems = balances
            .map(currency => [currency.currency, currency.amount])
            .slice(balancesRes.idx, (balancesRes.idx + 3 >= balances.length ? balances.length : balancesRes.idx + 3))

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
                    ["Address", addressRes],
                    ["Threshold", keysRes.threshold]
                ]} />

                <p style={plainTitleStyle}>Keys</p>
                <List columns={publicKeysColumns}
                    items={pubItems}
                    onElementClick={[
                        (x) => this.props.history.push(`/accounts/${x}`),
                        null
                    ]}
                    onPrevClick={() => this.onPubPrev()}
                    onNextClick={() => this.onPubNext()}
                    isFirstPage={keysRes.idx === 0}
                    isLastPage={keysRes.idx + 3 >= keys.length} />

                <p style={plainTitleStyle}>Balances</p>
                <List columns={BalancesColumns}
                    items={balancesItems}
                    onElementClick={[
                        (x) => this.props.history.push(`/currency/${x}`),
                        null
                    ]}
                    onPrevClick={() => this.onBalancePrev()}
                    onNextClick={() => this.onBalanceNext()}
                    isFirstPage={balancesRes.idx === 0}
                    isLastPage={balancesRes.idx + 3 >= balances.length} />
            </Card>
        );
    }

    renderOperations() {
        const { idx, linkStack, operations } = this.state.operationsRes;

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
                    onElementClick={[
                        (x) => this.props.history.push(`/operation/${x}`),
                        null,
                        null,
                    ]}
                    onPrevClick={() => this.onOperationPrev()}
                    onNextClick={() => this.onOperationNext()}
                    isFirstPage={idx === 0}
                    isLastPage={idx + 1 >= linkStack.length} />
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
    modelVersion: state.info.modelVersion,
});

export default connect(
    mapStateToProps,
    null
)(Account);