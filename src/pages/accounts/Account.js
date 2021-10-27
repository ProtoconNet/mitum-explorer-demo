import React, { Component } from "react";
import { connect } from 'react-redux';

import './Account.scss';
import Card from "../../components/views/Card";
import SearchBox from "../../components/SearchBox";
import List from "../../components/views/List";
import DetailCard from "../../components/views/DetailCard";

import page, { account as pageInfo } from '../../lib/page.json';
import { account as accountKeys } from '../../lib/keys.json';
import message from '../../lib/message.json';
import columns from '../../lib/columns.json';
import { getAccount, getAccountOperations, getResponse, isAddress, parseDate } from "../../lib";
import LoadingIcon from "../../components/LoadingIcon";

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
    isAccountLoad: false,
    isOperLoad: false,
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
        getAccount(this.props.api, address)
            .then(
                res => {
                    const data = res.data._embedded;

                    this.setState({
                        isAccountLoad: true,
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
                        isAccountLoad: true,
                    });
                }
            )

        getAccountOperations(this.props.api, address)
            .then(
                res => {
                    const operations = res.data._embedded;
                    const { self, next } = res.data._links;
                    const nextState = {
                        operations: operations.map(
                            operation => ({
                                factHash: operation._embedded.operation.fact.hash,
                                date: operation._embedded.confirmed_at,
                                height: operation._embedded.height,
                            })
                        ),
                        idx: 0,
                    }

                    getResponse(this.props.api, next.href)
                        .then(
                            res => {
                                this.setState({
                                    isOperLoad: true,
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
                                    isOperLoad: true,
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
                        isOperLoad: true,
                        operationsRes: {
                            ...initialState.operationsRes,
                        }
                    });
                }
            )
    }

    componentDidMount() {
        const { params } = this.props.match;
        if (Object.prototype.hasOwnProperty.call(params, pageInfo.key)) {
            this.loadAccountInfo(params.address);
        }
        else {
            this.props.history.push(page.accounts.default);
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
            window.location.reload();
        }
        else {
            this.props.history.push(`${page.accounts.default}/${search}`);
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
            this.setState({ isOperLoad: true });
            return;
        }
        else {
            getResponse(this.props.api, linkStack[idx - 1])
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
                                        height: operation._embedded.height,
                                    })
                                ),
                                idx: idx - 1,
                            },
                            isOperLoad: true,
                        });
                    }
                )
                .catch(
                    e => {
                        this.setState({
                            isOperLoad: true,
                        });
                        console.error(`${message.error.network} ${message.error.operations}`);
                    }
                )
        }
    }

    onOperationNext() {
        const { idx, linkStack } = this.state.operationsRes;

        if (idx + 1 >= linkStack.length) {
            this.setState({ isOperLoad: true });
            return;
        }
        else {
            getResponse(this.props.api, linkStack[idx + 1])
                .then(
                    res => {
                        const operations = res.data._embedded;
                        const nextState = {
                            ...this.state.operationsRes,
                            operations: operations.map(
                                operation => ({
                                    factHash: operation._embedded.operation.fact.hash,
                                    date: operation._embedded.confirmed_at,
                                    height: operation._embedded.height,
                                })
                            ),
                            idx: idx + 1,
                        }

                        if (idx + 2 > linkStack.length) {
                            const { next } = res.data._links;
                            getResponse(this.props.api, next.href)
                                .then(
                                    nextRes => {
                                        this.setState({
                                            operationsRes: {
                                                ...nextState,
                                                linkStack: linkStack.concat([next.href]),
                                            },
                                            isOperLoad: true,
                                        })
                                    }
                                )
                                .catch(
                                    e => {
                                        this.setState({
                                            operationsRes: {
                                                ...nextState,
                                            },
                                            isOperLoad: true,
                                        })
                                    }
                                )
                        }
                        else {
                            this.setState({
                                operationsRes: {
                                    ...nextState,
                                },
                                isOperLoad: true,
                            })
                        }
                    }
                )
                .catch(
                    e => {
                        this.setState({
                            isOperLoad: true,
                        });
                        console.error(`${message.error.network} ${message.error.operations}`);
                    }
                )
        }

    }

    renderAccountInfo() {
        const { addressRes, balancesRes, keysRes, isAccountLoad } = this.state;

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

        if (isAccountLoad) {
            return (
                <Card id="account-info" title="Account Information">
                    <DetailCard items={[
                        [accountKeys.address, addressRes],
                        [accountKeys.threshold, keysRes.threshold]
                    ]} />

                    <p style={plainTitleStyle}>Keys</p>
                    <List columns={Object.values(columns.public_keys)}
                        items={pubItems}
                        onElementClick={[
                            (x) => this.props.history.push(`${page.accounts.default}/${x}`),
                            null
                        ]}
                        onPrevClick={() => this.onPubPrev()}
                        onNextClick={() => this.onPubNext()}
                        isFirstPage={keysRes.idx === 0}
                        isLastPage={keysRes.idx + 3 >= keys.length} />

                    <p style={plainTitleStyle}>Balances</p>
                    <List columns={Object.values(columns.balances)}
                        items={balancesItems}
                        onElementClick={[
                            (x) => this.props.history.push(`${page.currency.default}/${x}`),
                            null
                        ]}
                        onPrevClick={() => this.onBalancePrev()}
                        onNextClick={() => this.onBalanceNext()}
                        isFirstPage={balancesRes.idx === 0}
                        isLastPage={balancesRes.idx + 3 >= balances.length} />
                </Card>
            );
        }
        else {
            return <Card id="account-info" title="Account Information"><LoadingIcon /></Card>
        }

    }

    renderOperations() {
        const { isOperLoad } = this.state;
        const { idx, linkStack, operations } = this.state.operationsRes;

        if (!operations) {
            return (
                <Card id="operations" title="Operations">
                    <p>{message.replace.null}</p>
                </Card>
            )
        }

        const operationItems = operations
            .map(operation => [operation.factHash, parseDate(operation.date), operation.height]);

        return (
            <Card id="operations" title="Operations">
                {
                    isOperLoad
                        ? (
                            <List columns={Object.values(columns.operations)}
                                items={operationItems}
                                onElementClick={[
                                    (x) => this.props.history.push(`${page.operation.default}/${x}`),
                                    null,
                                    (x) => this.props.history.push(`${page.block.default}/${x}`),
                                ]}
                                onPrevClick={() => { this.setState({ isOperLoad: false }); this.onOperationPrev(); }}
                                onNextClick={() => { this.setState({ isOperLoad: false }); this.onOperationNext(); }}
                                isFirstPage={idx === 0}
                                isLastPage={idx + 1 >= linkStack.length} />
                        )
                        : <LoadingIcon />
                }
            </Card>
        );
    }

    render() {
        const state = this.state;
        return (
            <div className="account-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder={message.placeholder.account}
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
    api: state.network.api,
    modelVersion: state.info.modelVersion,
});

export default connect(
    mapStateToProps,
    null
)(Account);