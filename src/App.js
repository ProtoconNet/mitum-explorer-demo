import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import './App.scss';
import Navigation from './components/Navigation';
import Account from './pages/accounts/Account';
import Accounts from './pages/accounts/Accounts';
import Blocks from './pages/blocks/Blocks';
import Currencies from './pages/currencies/Currencies';
import NodeInfo from './pages/node/NodeInfo';
import Operation from './pages/operations/Operation';
import Operations from './pages/operations/Operations';
import Items from './pages/operations/Items';
import axios from 'axios';
import { connect } from 'react-redux';
import { setNodeInfo } from './store/actions';

const getNodeInfo = async () => {
  return await axios.get(process.env.REACT_APP_NETWORK);
}

class App extends Component {

  loadNodeInfo() {
    getNodeInfo()
      .then(
        res => {
          const data = res.data._embedded;

          const modelVersion = res.data._hint.slice(process.env.REACT_APP_HAL_HINT.length, -1);
          const networkVersion = data.version;
          const blockHeight = data.last_block.height;

          this.props.setNodeInfo(modelVersion, networkVersion, blockHeight);
        }
      )
      .catch(
        e => {
          console.error("Cannot load node information");
        }
      )

    setTimeout(
      () => this.loadNodeInfo(), 5000
    );
  }

  componentDidMount() {
    this.loadNodeInfo();
  }

  render() {
    return (
      <div className="App" >
        <BrowserRouter>
          <Navigation />
          <Route exact path="/" component={NodeInfo} />

          <Route exact path="/blocks" component={Blocks} />
          <Route path="/block/:block" component={Blocks} />

          <Route exact path="/account" component={Account} />
          <Route path="/account/:address" component={Account} />

          <Route exact path="/accounts" component={Accounts} />
          <Route path="/accounts/:publickey" component={Accounts} />

          <Route exact path="/operations" component={Operations} />
          <Route path="/operations/:address" component={Operations} />

          <Route exact path="/operation" component={Operation} />
          <Route exact path="/operation/:hash" component={Operation} />
          <Route path="/operation/:hash/item" component={Items} />

          <Route exact path="/currencies" component={Currencies} />
          <Route path="/currency/:currency" component={Currencies} />
        </BrowserRouter>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  setNodeInfo: (modelVer, netVer, height) => dispatch(setNodeInfo(modelVer, netVer, height)),
});

export default connect(
  null,
  mapDispatchToProps
)(App);
