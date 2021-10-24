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

function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Route exact path="/" component={NodeInfo} />
        <Route path="/blocks" component={Blocks} />
        <Route exact path="/account" component={Account} />
        <Route path="/account/:address" component={Account} />
        <Route path="/accounts/:publickey" component={Accounts} />
        <Route exact path="/operations" component={Operations} />
        <Route path="/operations/:address" component={Operations} />
        <Route exact path="/operation" component={Operation} />
        <Route exact path="/operation/:hash" component={Operation} />
        <Route path="/operation/:hash/item" component={Items} />
        <Route exact path="/currencies" component={Currencies} />
        <Route path="/currencies/:currency" component={Currencies} />
      </BrowserRouter>
    </div>
  );
}

export default App;
