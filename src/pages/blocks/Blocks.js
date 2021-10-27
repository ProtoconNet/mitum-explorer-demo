import React, { Component } from "react";
import { connect } from "react-redux";

import "./Blocks.scss";

import Card from "../../components/views/Card";
import SearchBox from "../../components/SearchBox";
import DetailCard from "../../components/views/DetailCard";
import List from "../../components/views/List";

import page, { block as pageInfo } from '../../lib/page.json';
import message from '../../lib/message.json';
import columns from "../../lib/columns.json";
import { getBlock, getBlockOperations, getBlocks, getResponse, parseDate } from "../../lib";
import LoadingIcon from "../../components/LoadingIcon";

const initialState = {
    idx: 0,
    blocks: [],
    stack: [],
    showBlocks: true,
    blockRes: {
        idx: 0,
        stack: [],
        operations: [],
        hash: "",
        date: "",
        height: 0,
    },
    isBlockLoad: false,
    isBlocksLoad: false,
}

class Blocks extends Component {
    constructor(props) {
        super(props);

        this.state = {
            search: "",
            ...initialState,
        };
    }

    async getBlocks() {
        return await getBlocks(this.props.api, this.props.blockHeight);
    };

    loadBlocks() {
        this.getBlocks()
            .then(
                res => {
                    const blocks = res.data._embedded;
                    const { self, next } = res.data._links;

                    const nextState = {
                        idx: 0,
                        blocks: blocks.map(
                            block => {
                                const { hash, height, confirmed_at } = block._embedded;
                                return {
                                    hash,
                                    height,
                                    date: confirmed_at,
                                }
                            }
                        ),
                        blockRes: {},
                        showBlocks: true,
                        isBlocksLoad: true,
                    };

                    getResponse(this.props.api, next.href)
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
                        isBlocksLoad: true,
                    });
                }
            )
    }

    loadBlock(block) {
        getBlock(this.props.api, block)
            .then(
                res => {
                    const data = res.data._embedded;
                    const { hash, height, confirmed_at } = data;

                    const nextState = {
                        idx: 0,
                        hash,
                        height,
                        date: confirmed_at,
                    }

                    getBlockOperations(this.props.api, block)
                        .then(
                            nextRes => {
                                const data = nextRes.data._embedded;
                                const { self, next } = nextRes.data._links;

                                const operations = data.map(
                                    operation => ({
                                        factHash: operation._embedded.operation.fact.hash,
                                        date: operation._embedded.confirmed_at,
                                        height: operation._embedded.height,
                                    })
                                )

                                getResponse(this.props.api, next.href)
                                    .then(
                                        finalRes => {
                                            this.setState({
                                                ...initialState,
                                                blockRes: {
                                                    ...nextState,
                                                    operations,
                                                    stack: [self.href, next.href]
                                                },
                                                showBlocks: false,
                                                isBlockLoad: true,
                                            });
                                        }
                                    )
                                    .catch(
                                        e => {
                                            this.setState({
                                                ...initialState,
                                                showBlocks: false,
                                                blockRes: {
                                                    ...nextState,
                                                    operations,
                                                    stack: [self.href],
                                                },
                                                isBlockLoad: true,
                                            })
                                        }
                                    )
                            }
                        )
                        .catch(
                            e => {
                                this.setState({
                                    ...initialState,
                                    showBlocks: false,
                                    blockRes: {
                                        ...nextState,
                                        idx: 0,
                                        stack: [],
                                        operations: [],
                                    },
                                    isBlockLoad: true,
                                })
                            }
                        )
                }
            )
            .catch(
                e => {
                    this.setState({
                        ...initialState,
                        isBlockLoad: true,
                    })
                }
            )
    }

    componentDidMount() {
        const { params } = this.props.match;
        if (Object.prototype.hasOwnProperty.call(params, pageInfo.key)) {
            this.loadBlock(params.block);
        }
        else {
            this.loadBlocks();
        }
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value,
        });
    }

    onSearch() {
        const { search } = this.state;
        if (search) {
            this.props.history.push(`${page.block.default}/${this.state.search}`);
            window.location.reload();
        }
    }

    onBlocksPrev() {
        const { idx, stack } = this.state;
        if (idx <= 0) {
            this.setState({
                isBlocksLoad: true,
            })
            return;
        }

        getResponse(this.props.api, stack[idx - 1])
            .then(
                res => {
                    const blocks = res.data._embedded;
                    this.setState({
                        idx: idx - 1,
                        blocks: blocks.map(
                            block => {
                                const { hash, height, confirmed_at } = block._embedded;
                                return {
                                    hash,
                                    height,
                                    date: confirmed_at,
                                }
                            }
                        ),
                        blockRes: {},
                        showBlocks: true,
                        isBlocksLoad: true,
                    })
                }
            )
            .catch(
                e => {
                    this.setState({
                        ...initialState,
                        isBlocksLoad: true,
                    })
                }
            )
    }

    onBlocksNext() {
        const { idx, stack } = this.state;

        if (idx + 1 >= stack.length) {
            this.setState({
                isBlocksLoad: true,
            })
            return false;
        }

        getResponse(this.props.api, stack[idx + 1])
            .then(
                res => {
                    const blocks = res.data._embedded;
                    const { next } = res.data._links;

                    const nextState = {
                        idx: idx + 1,
                        blocks: blocks.map(
                            block => {
                                const { hash, height, confirmed_at } = block._embedded;
                                return {
                                    hash,
                                    height,
                                    date: confirmed_at,
                                }
                            }
                        ),
                        blockRes: {},
                        showBlocks: true,
                        isBlocksLoad: true,
                    };

                    if (idx + 2 > stack.length) {
                        this.setState({
                            ...nextState,
                        })
                    }

                    getResponse(this.props.api, next.href)
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
            )
            .catch(
                e => {
                    this.setState({
                        isBlocksLoad: true,
                    });
                    console.error(`${message.error.network} ${message.error.blocks}`);
                }
            )
    }

    onOperationsPrev() {
        const block = this.state.blockRes;
        const { idx, stack } = block;

        if (idx <= 0) {
            this.setState({
                isBlockLoad: true,
            })
            return;
        }

        getResponse(this.props.api, stack[idx - 1])
            .then(
                res => {
                    const data = res.data._embedded;
                    const operations = data.map(
                        operation => ({
                            factHash: operation._embedded.operation.fact.hash,
                            date: operation._embedded.confirmed_at,
                            height: operation._embedded.height,
                        })
                    );

                    this.setState({
                        blockRes: {
                            idx: idx - 1,
                            operations,
                        },
                        showBlocks: false,
                        isBlockLoad: true,
                    });
                }
            )
            .catch(
                e => {
                    this.setState({
                        isBlockLoad: true,
                    })
                    console.error(`${message.error.network} ${message.error.operations}`);
                }
            )
    }

    onOperationsNext() {
        const block = this.state.blockRes;
        const { idx, stack } = block;

        if (idx + 1 >= stack.length) {
            this.setState({
                isBlockLoad: true,
            })
            return;
        }

        getResponse(this.props.api, stack[idx + 1])
            .then(
                res => {
                    const data = res.data._embedded;
                    const operations = data.map(
                        operation => ({
                            factHash: operation._embedded.operation.fact.hash,
                            date: operation._embedded.confirmed_at,
                            height: operation._embedded.height,
                        })
                    );

                    const nextState = {
                        operations,
                        idx: idx + 1,
                    }

                    if (idx + 2 > stack.length) {
                        this.setState({
                            blockRes: {
                                ...nextState
                            },
                            showBlocks: false,
                            isBlockLoad: true,
                        });
                        return;
                    }

                    const { next } = res.data._links;
                    getResponse(this.props.api, next.href)
                        .then(
                            nextRes => {
                                this.setState({
                                    blockRes: {
                                        ...nextState,
                                        stack: stack.concat([next.href]),
                                    },
                                    showBlocks: false,
                                    isBlockLoad: true,
                                });
                            }
                        )
                        .catch(
                            e => {
                                this.setState({
                                    blockRes: {
                                        ...nextState,
                                    },
                                    showBlocks: false,
                                    isBlockLoad: true,
                                });
                            }
                        )
                }
            )
            .catch(
                e => {
                    this.setState({
                        isBlockLoad: true,
                    })
                    console.error(`${message.error.network} ${message.error.operations}`);
                }
            )
    }

    renderBlock() {
        const { isBlockLoad } = this.state;
        const { hash, date, height, operations } = this.state.blockRes;

        if (!hash || !operations) {
            return (
                <Card title="Block Information">
                    <p>{message.replace.null}</p>
                </Card>
            )
        }

        const infoItems = [
            [columns.blocks.hash, hash],
            [columns.blocks.height, height],
            [columns.blocks.date, parseDate(date)],
        ];

        const operationItems = operations.map(
            operation => [
                operation.factHash,
                parseDate(operation.date),
                operation.height,
            ]
        )

        const { idx, stack } = this.state.blockRes;

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
            isBlockLoad
                ? (
                    <Card title="Block Information">
                        <DetailCard items={infoItems} />
                        <p style={plainTitleStyle}>Operations</p>
                        <List
                            columns={Object.values(columns.operations)}
                            items={operationItems}
                            onElementClick={[
                                (x) => { this.props.history.push(`${page.operation.default}/${x}`); },
                                null,
                                (x) => { this.props.history.push(`${page.block.default}/${x}`); window.location.reload() }
                            ]}
                            onPrevClick={() => { this.setState({ isBlockLoad: false }); this.onOperationsPrev(); }}
                            onNextClick={() => { this.setState({ isBlockLoad: false }); this.onOperationsNext(); }}
                            isLastPage={idx + 1 >= stack.length}
                            isFirstPage={idx <= 0}
                        />
                    </Card>
                )
                : (
                    <Card title="Block Information">
                        <LoadingIcon />
                    </Card>
                )
        );
    }

    renderBlocks() {
        const { idx, stack, blocks, isBlocksLoad } = this.state;

        if (!blocks) {
            return (
                <Card title="Blocks">
                    <p>Not found</p>
                </Card>
            )
        }
        const items = blocks.map(
            block => [
                block.hash,
                block.height,
                parseDate(block.date),
            ]
        );

        const { history } = this.props;
        return (
            <Card title="Blocks">
                {
                    isBlocksLoad
                        ? (
                            <List
                                columns={Object.values(columns.blocks)}
                                items={items}
                                onElementClick={[
                                    (x) => { history.push(`${page.block.default}/${x}`); window.location.reload(); },
                                    (x) => { history.push(`${page.block.default}/${x}`); window.location.reload(); },
                                    null]}
                                onPrevClick={() => { this.setState({ isBlocksLoad: false }); this.onBlocksPrev(); }}
                                onNextClick={() => { this.setState({ isBlocksLoad: false }); this.onBlocksNext(); }}
                                isLastPage={idx + 1 >= stack.length}
                                isFirstPage={idx <= 0}
                            />
                        )
                        : <LoadingIcon />
                }
            </Card>
        )
    }

    render() {
        return (
            <div className="blocks-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder={message.placeholder.block}
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch()}
                        value={this.state.search}
                    />
                </Card>
                {
                    this.state.showBlocks
                        ? this.renderBlocks()
                        : this.renderBlock()
                }
            </div>
        );
    }
}

const mapStateToProps = state => ({
    blockHeight: state.info.blockHeight,
    api: state.network.api,
});

export default connect(
    mapStateToProps,
    null
)(Blocks);