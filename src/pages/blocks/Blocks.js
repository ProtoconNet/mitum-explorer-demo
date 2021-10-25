import React, { Component } from "react";
import "./Blocks.scss";
import Card from "../../components/Card";
import SearchBox from "../../components/SearchBox";
import axios from "axios";
import { connect } from "react-redux";
import DetailCard from "../../components/DetailCard";
import List from "../../components/List";

const network = process.env.REACT_APP_NETWORK;
const blocksApi = process.env.REACT_APP_BLOCKS;
const blockApi = process.env.REACT_APP_BLOCK;
const operationsApi = process.env.REACT_APP_OPERATIONS;
const manifestApi = process.env.REACT_APP_MANIFEST;

const blocksColumns = ["Hash", "Height", "Date"];
const blockOperationColumns = ["Fact hash", "Date", "Items"];

const checkNextLink = async (next) => {
    return await axios.get(network + next);
}

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
        return await axios.get(network + blocksApi + (this.props.blockHeight - 10));
    };

    async getBlock(block) {
        return await axios.get(`${network}${blockApi}${block}${manifestApi}`);
    };

    async getBlockOperations(block) {
        return await axios.get(`${network}${blockApi}${block}${operationsApi}`);
    }

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
                    };

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
                        ...initialState
                    });
                }
            )
    }

    loadBlock(block) {
        this.getBlock(block)
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

                    this.getBlockOperations(block)
                        .then(
                            nextRes => {
                                const data = nextRes.data._embedded;
                                const { self, next } = nextRes.data._links;

                                const operations = data.map(
                                    operation => ({
                                        factHash: operation._embedded.operation.fact.hash,
                                        date: operation._embedded.confirmed_at,
                                        items: Object.prototype.hasOwnProperty.call(operation._embedded.operation.fact, "items")
                                            ? operation._embedded.operation.fact.items.length
                                            : 0
                                    })
                                )

                                checkNextLink(next.href)
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
                                    showBlocks: false,
                                    blockRes: {
                                        ...nextState,
                                        idx: 0,
                                        stack: [],
                                        operations: [],
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
                    })
                }
            )
    }

    componentDidMount() {
        const { params } = this.props.match;
        if (Object.prototype.hasOwnProperty.call(params, "block")) {
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
            this.props.history.push(`/block/${this.state.search}`);
            window.location.reload();
        }
    }

    onBlocksPrev() {
        const {idx, stack} = this.state;
        if(idx <= 0) {
            return;
        }

        checkNextLink(stack[idx - 1])
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
                    })
                }
            )
            .catch(
                e => {
                    this.setState({
                        ...initialState,
                    })
                }
            )
    }

    onBlocksNext() {
        const {idx, stack} = this.state;

        if(idx + 1 >= stack.length) {
            return false;
        }

        checkNextLink(stack[idx + 1])
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
                    };

                    if(idx + 2 >= stack.length) {
                        this.setState({
                            ...nextState,
                        })
                    }

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
            )
    }

    onOperationsPrev() {

    }

    onOperationsNext() {

    }

    renderBlock() {
        const { hash, date, height, operations } = this.state.blockRes;

        if (!hash || !operations) {
            return (
                <Card title="Block Information">
                    <p>Not found</p>
                </Card>
            )
        }

        const infoItems = [
            ["Hash", hash],
            ["Height", height],
            ["Date", date],
        ];

        const operationItems = operations.map(
            operation => [
                operation.factHash,
                operation.date,
                operation.items,
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
            <Card title="Block Information">
                <DetailCard items={infoItems} />
                <p style={plainTitleStyle}>Operations</p>
                <List
                    columns={blockOperationColumns}
                    items={operationItems}
                    onElementClick={[
                        (x) => { this.props.history.push(`/operation/${x}`); window.location.reload(); },
                        null,
                        null
                    ]}
                    onPrevClick={() => this.onOperationsPrev()}
                    onNextClick={() => this.onOperationsNext()}
                    isLastPage={idx + 1 >= stack.length}
                    isFirstPage={idx <= 0}
                />
            </Card>
        );
    }

    renderBlocks() {
        const { idx, stack, blocks } = this.state;

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
                block.date,
            ]
        );

        const { history } = this.props;
        return (
            <Card title="Blocks">
                <List
                    columns={blocksColumns}
                    items={items}
                    onElementClick={[
                        (x) => { history.push(`/block/${x}`); window.location.reload(); },
                        (x) => { history.push(`/block/${x}`); window.location.reload(); },
                        null]}
                    onPrevClick={() => this.onBlocksPrev()}
                    onNextClick={() => this.onBlocksNext()}
                    isLastPage={idx + 1 >= stack.length}
                    isFirstPage={idx <= 0}
                />
            </Card>
        )
    }

    render() {
        return (
            <div className="blocks-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder="Enter block hash or block height"
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
});

export default connect(
    mapStateToProps,
    null
)(Blocks);