import React, { Component } from "react";
import { connect } from 'react-redux';

import './Accounts.scss';
import Card from "../../components/views/Card";
import SearchBox from "../../components/SearchBox";
import List from "../../components/views/List";
import DetailCard from "../../components/views/DetailCard";

import page, { accounts as pageInfo } from '../../lib/page.json';
import columns from "../../lib/columns.json";
import { getAccounts, getResponse, isAddress } from "../../lib";
import LoadingIcon from "../../components/LoadingIcon";

const initialState = {
    idx: 0,
    accounts: [],
    stack: [],
    isLoad: false,
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
                        isLoad: true,
                    }

                    getResponse(next.href)
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
                        isLoad: true,
                    });
                }
            )
    }

    componentDidMount() {
        const { params } = this.props.match;
        if (Object.prototype.hasOwnProperty.call(params, pageInfo.key)) {
            this.loadAccounts(params.publickey);
            this.setState({ pubKey: params.publickey });
        }
        else {
            this.loadAccounts(process.env.REACT_APP_GENESIS_PUB_KEY);
            this.setState({ pubKey: process.env.REACT_APP_GENESIS_PUB_KEY });
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

        if (isAddress(search, version)) {
            this.props.history.push(`${page.account.default}/${search}`);
        }
        else {
            this.props.history.push(`${page.accounts.default}/${search}`);
            window.location.reload();
        }
    }

    onAccountsPrev() {
        const { idx, stack } = this.state;

        if (idx <= 0) {
            this.setState({ isLoad: true });
            return;
        }

        getResponse(stack[idx - 1])
            .then(
                res => {
                    const accounts = res.data._embedded;
                    this.setState({
                        accounts: accounts.map(account => account._embedded.address),
                        idx: idx - 1,
                        isLoad: true,
                    });
                }
            )
            .catch(
                e => {
                    this.setState({
                        isLoad: true
                    });
                    console.error("Network error! cannot load accounts.");
                }
            )
    }

    onAccountsNext() {
        const { idx, stack } = this.state;

        if (idx + 1 >= stack.length) {
            this.setState({ isLoad: true });
            return;
        }

        getResponse(stack[idx + 1])
            .then(
                res => {
                    const accounts = res.data._embedded;
                    const nextState = {
                        accounts: accounts.map(account => account._embedded.address),
                        idx: idx + 1,
                        isLoad: true,
                    };

                    if (idx + 2 > stack.length) {
                        const { next } = res.data._links;
                        getResponse(next.href)
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
                    else {
                        this.setState({
                            ...nextState,
                        })
                    }
                }
            )
            .catch(
                e => {
                    this.setState({
                        isLoad: true,
                    });
                    console.error("Network error! Cannot load accounts.");
                }
            )
    }

    renderAccounts() {
        const { accounts, idx, stack, pubKey, isLoad } = this.state;
        const items = accounts.map(addr => ([addr]));

        return (
            isLoad
                ? (
                    <Card id="accounts" title="Accounts">
                        <DetailCard items={[
                            ["Public Key", pubKey],
                        ]} />
                        <List
                            columns={Object.values(columns.accounts)}
                            items={items}
                            onElementClick={[(x) => this.props.history.push(`${page.account.default}/${x}`)]}
                            onPrev={() => { this.setState({ isLoad: false }); this.onAccountsPrev(); }}
                            onNext={() => { this.setState({ isLoad: false }); this.onAccountsNext(); }}
                            isFirstPage={idx <= 0}
                            isLastPage={idx + 1 >= stack.length}
                        />
                    </Card>
                )
                : (
                    <Card id="accounts" title="Accounts">
                        <LoadingIcon />
                    </Card>
                )
        );

    }

    render() {
        return (
            <div className="accounts-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter account address or public key"
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch()}
                        value={this.state.search} />
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