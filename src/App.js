import React, { Component } from 'react';
import { connect } from 'react-redux';
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

import page from './lib/page.json';
import { getNodeInfo } from './lib';

import { setNodeInfo } from './store/actions';

class App extends Component {

  loadNodeInfo() {
    getNodeInfo()
      .then(
        res => {
          const data = res.data._embedded;

          const modelVersion = res.data._hint.slice(process.env.REACT_APP_HAL_HINT.length + 1, res.data._hint.length);
          const networkVersion = data.version;
          const blockHeight = data.last_block.height;
          this.props.setNodeInfo(modelVersion, networkVersion, blockHeight);
        }
      )
      .catch(
        e => {
          console.error("Cannot load node information");
          console.log(e);
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
    const { node, account, accounts, block, blocks, operation, operations, currency, currencies } = page;
    return (
      <div className="App" >
        <BrowserRouter>
          <Navigation />
          <Route exact path={node.default} component={NodeInfo} />

          <Route exact path={blocks.default} component={Blocks} />
          <Route exact path={block.default} component={Blocks} />
          <Route path={block.params} component={Blocks} />

          <Route exact path={account.default} component={Account} />
          <Route path={account.params} component={Account} />

          <Route exact path={accounts.default} component={Accounts} />
          <Route path={accounts.params} component={Accounts} />

          <Route exact path={operations.default} component={Operations} />
          <Route path={operations.params} component={Operations} />

          <Route exact path={operation.default} component={Operation} />
          <Route exact path={operation.params} component={Operation} />

          <Route exact path={currencies.default} component={Currencies} />
          <Route exact path={currency.default} component={Currencies} />
          <Route path={currency.params} component={Currencies} />
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
