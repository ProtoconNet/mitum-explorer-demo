import React, { Component } from 'react';
import './Document.scss';

import SearchBox from '../../components/SearchBox';
import Card from '../../components/views/Card';
import LoadingIcon from '../../components/LoadingIcon';
import DataView from '../../components/DataView';
import DetailCard from '../../components/views/DetailCard';
import { getDocument, isBlockCityDocumentId } from '../../lib';

import message from '../../lib/message.json';
import { document as docKeys } from '../../lib/keys.json';
import page, { document as pageInfo } from '../../lib/page.json';
import { blockcity as hint } from '../../lib/hint.json';
import { connect } from 'react-redux';

const initialState = {
    raw: "",
    docType: "",
    id: "",
    owner: "",
    detailed: {},
    height: undefined,
    isLoad: true,
}

class Document extends Component {

    constructor(props) {
        super(props);

        this.state = {
            search: "",
            ...initialState,
        }
    }

    loadDocument(id) {
        getDocument(this.props.api, id)
            .then(
                res => {
                    const data = res.data._embedded;
                    const document = data.document
                    const docType = document.info.doctype;
                    const owner = document.owner;
                    const height = data.height;

                    let detailed = {};
                    switch (docType) {
                        case hint.doctype.user:
                            detailed = {
                                gold: document.gold,
                                bankgold: document.bankgold,
                                statistics: document.statistics
                            }
                            break;
                        case hint.doctype.land:
                            detailed = {
                                address: document.address,
                                area: document.area,
                                renter: document.renter,
                                account: document.account,
                                rentdate: document.rentdate,
                                periodday: document.periodday
                            }
                            break;
                        case hint.doctype.vote:
                            detailed = {
                                round: document.round,
                                endvotetime: document.endvotetime,
                                candidates: document.candidates,
                                bossname: document.bossname,
                                account: document.account,
                                termofoffice: document.termofoffice
                            }
                            break;
                        case hint.doctype.history:
                            detailed = {
                                name: document.name,
                                account: document.account,
                                date: document.date,
                                usage: document.usage,
                                application: document.application
                            }
                            break;
                        default:
                            detailed = {};
                    }

                    this.setState({
                        isLoad: true,
                        raw: JSON.stringify(res.data, null, 4),
                        id: document.info.docid.id,
                        detailed,
                        docType,
                        owner,
                        height,
                    });
                }
            )
            .catch(
                e => {
                    console.log(e)
                    this.setState({
                        ...initialState,
                        isLoad: true
                    });
                }
            )
    }

    componentDidMount() {
        const { params } = this.props.match;
        if (Object.prototype.hasOwnProperty.call(params, pageInfo.key)) {
            this.setState({ isLoad: false })
            this.loadDocument(params.id);
        }
        else {
            this.props.history.push(page.document.default);
        }
    }

    onSearchChange(e) {
        this.setState({
            search: e.target.value
        });
    }

    onSearch() {
        const search = this.state.search.trim();

        if (!search) {
            return;
        }

        if (isBlockCityDocumentId(search)) {
            this.props.history.push(`${page.document.default}/${search}`);
            window.location.reload();
        }
        else {
            alert("invalid document id")
            this.setState({
                search: ""
            });
        }
    }

    userData() {
        const { detailed } = this.state;
        const user = [[
            "User Data", [
                [docKeys.user.gold, detailed.gold],
                [docKeys.user.bankgold, detailed.bankgold],
                [docKeys.user.hp, detailed.statistics.hp],
                [docKeys.user.str, detailed.statistics.strength],
                [docKeys.user.dex, detailed.statistics.dexterity],
                [docKeys.user.cha, detailed.statistics.charisma],
                [docKeys.user.intel, detailed.statistics.intelligence],
                [docKeys.user.vital, detailed.statistics.vital]
            ]
        ]];

        return <DetailCard keyIndex={null} items={user} />
    }

    landData() {
        const { detailed } = this.state;
        const land = [[
            "Land Data", [
                [docKeys.land.address, detailed.address],
                [docKeys.land.area, detailed.area],
                [docKeys.land.renter, detailed.renter],
                [docKeys.land.account, detailed.account, [null, (x) => this.props.history.push(`${page.account.default}/${x}`)]],
                [docKeys.land.rentdate, detailed.rentdate],
                [docKeys.land.period, detailed.periodday]
            ]
        ]]

        return <DetailCard keyIndex={null} items={land} />
    }

    voteData() {
        const { detailed } = this.state;
        const candidates = detailed.candidates.map(
            (x, idx) => ([`${docKeys.vote.candidate} ${idx}`, x.address, [null, (x) => this.props.history.push(`${page.account.default}/${x}`)]])
        )

        const vote = [[
            "Vote Data", [
                [docKeys.vote.round, detailed.round],
                [docKeys.vote.endtime, detailed.endvotetime],
                [docKeys.vote.bossname, detailed.bossname],
                [docKeys.vote.account, detailed.account, [null, (x) => this.props.history.push(`${page.account.default}/${x}`)]],
                [docKeys.vote.office, detailed.termofoffice],
                ...candidates
            ]
        ]]

        return <DetailCard keyIndex={null} items={vote} />
    }

    historyData() {
        const { detailed } = this.state;

        const history = [[
            "History Data", [
                [docKeys.history.name, detailed.name],
                [docKeys.history.account, detailed.account, [null, (x) => this.props.history.push(`${page.account.default}/${x}`)]],
                [docKeys.history.date, detailed.date],
                [docKeys.history.usage, detailed.usage],
                [docKeys.history.app, detailed.application]
            ]
        ]]

        return <DetailCard keyIndex={null} items={history} />
    }

    document() {
        switch (this.state.docType) {
            case hint.doctype.user:
                return this.userData();
            case hint.doctype.land:
                return this.landData();
            case hint.doctype.vote:
                return this.voteData();
            case hint.doctype.history:
                return this.historyData();
            default: return null;
        }
    }

    infoItem() {
        const { docType, id, owner, height } = this.state;

        const infoItem = [[
            docKeys.title, [
                [docKeys.doctype, docType],
                [docKeys.docid, id],
                [docKeys.owner, owner, [null, (x) => this.props.history.push(`${page.account.default}/${x}`)]],
                [docKeys.height, height, [null, typeof height === "number" ? (x) => this.props.history.push(`${page.block.default}/${x}`) : null]],
            ]
        ]];

        return infoItem;
    }
    render() {
        const infoItem = this.state.isLoad ? this.infoItem() : null;

        return (
            <div className="document-container">
                <Card id="search" title="Search">
                    <SearchBox
                        disabled={false}
                        placeholder={message.placeholder.document}
                        onChange={(e) => this.onSearchChange(e)}
                        onSearch={() => this.onSearch()}
                        value={this.state.search} />
                </Card>
                {
                    this.state.isLoad
                        ? (
                            <Card title="Document Information">
                                <DetailCard keyIndex={null} items={infoItem} />
                                {this.document()}
                                <DataView data={this.state.raw} />
                            </Card>
                        ) :
                        (
                            <Card title="Document Information">
                                <LoadingIcon />
                            </Card>
                        )
                }
            </div>
        );
    }
}

const mapStateToProps = state => ({
    modelVersion: state.info.modelVersion,
    api: state.network.api,
});

export default connect(
    mapStateToProps,
    null
)(Document);