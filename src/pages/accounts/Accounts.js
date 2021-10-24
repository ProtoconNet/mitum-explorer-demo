import React, { Component } from "react";
import { connect } from 'react-redux';
import './Accounts.scss';
import Card from "../../components/Card";
import SearchBox from "../../components/SearchBox";
import List from "../../components/List";

import axios from "axios";
import DetailCard from "../../components/DetailCard";

const network = process.env.REACT_APP_NETWORK;
const accountsApi = process.env.REACT_APP_ACCOUNTS;

const accountsColumns = ["Account"];

const getAccounts = async (publicKey) => {
    return await axios.get(network + accountsApi + publicKey);
}

const checkNextLink = async (next) => {
    return await axios.get(network + next);
}

const initialState = {
    idx: 0,
    accounts: [],
    stack: [],
}

class Accounts extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pubKey: "",
            search: "",
            ...initialState,
        }
    }

    loadAccounts(publicKey) {
        getAccounts(publicKey)
            .then(
                res => {
                    const accounts = res.data._embedded;
                    const { self, next } = res.data._links;
                    const nextState = {
                        accounts: accounts.map(account => account._embedded.address),
                        idx: 0,
                    }

                    checkNextLink(next.href)
                        .then(
                            nextRes => {
                                this.setState({
                                    ...nextState,
                                    stack: [self.href, next.href],
                                })
                            }
                        )
                        .catch(
                            e => {
                                this.setState({
                                    ...nextState,
                                    stack: [self.href],
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
        if (Object.prototype.hasOwnProperty.call(params, "publickey")) {
            this.loadAccounts(params.publickey);
            this.setState({pubKey: params.publickey});
        }
        else {
            this.loadAccounts(process.env.REACT_APP_GENESIS_PUB_KEY);
            this.setState({pubkey: process.env.REACT_APP_GENESIS_PUB_KEY});
        }
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    onSearch() {
        if (this.isAddress(this.state.search)) {
            this.props.history.push(`/account/${this.state.search}`);
        }
        else {
            this.props.history.push(`/accounts/${this.state.search}`);
            window.location.reload();
        }
    }

    onAccountsPrev() {
        const { idx, stack } = this.state;

        if (idx <= 0) {
            return;
        }

        checkNextLink(stack[idx - 1])
            .then(
                res => {
                    const accounts = res.data._embedded;
                    this.setState({
                        accounts: accounts.map(account => account._embedded.address),
                        idx: idx - 1
                    });
                }
            )
            .catch(
                e => alert("Network error!")
            )
    }

    onAccountsNext() {
        const { idx, stack } = this.state;

        if (idx + 1 >= stack.length) {
            return;
        }

        checkNextLink(stack[idx + 1])
            .then(
                res => {
                    const accounts = res.data._embedded;
                    const nextState = {
                        accounts: accounts.map(account => account._embedded.address),
                        idx: idx + 1,
                    };

                    if (idx + 2 >= stack.length) {
                        const { next } = res.data._links;
                        checkNextLink(next.href)
                            .then(
                                nextRes => {
                                    this.setState({
                                        ...nextState,
                                        stack: stack.concat([next.href])
                                    });
                                }
                            )
                            .catch(
                                e => {
                                    this.setState({
                                        ...nextState,
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

    isAddress(target) {
        const { modelVersion } = this.props;

        if (target.indexOf(`:${process.env.REACT_APP_ACCOUNT_HINT}-${modelVersion}`) > -1) {
            return true;
        }
        return false;
    }

    renderAccounts() {
        const { accounts, idx, stack, pubKey } = this.state;
        const items = accounts.map(addr => ([addr]));

        return (
            <Card id="accounts" title="Accounts">
                <DetailCard items={[
                    ["Public Key", pubKey],
                ]} />
                <List
                    columns={accountsColumns}
                    items={items}
                    onElementClick={[(x) => this.props.history.push(`/account/${x}`)]}
                    onPrev={() => this.onAccountsPrev()}
                    onNext={() => this.onAccountsNext()}
                    isFirstPage={idx <= 0}
                    isLastPage={idx + 1 >= stack.length}
                />
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
                {this.renderAccounts()}
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
)(Accounts);