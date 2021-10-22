import { BrowserRouter, Route } from 'react-router-dom';
import './App.scss';
import Navigation from './components/Navigation';
import Account from './pages/accounts/Account';
import Accounts from './pages/accounts/Accounts';
import Blocks from './pages/blocks/Blocks';
import Currencies from './pages/currencies/Currencies';
import NodeInfo from './pages/node/NodeInfo';
import Operations from './pages/operations/Operations';

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
        <Route path="/operations" component={Operations} />
        <Route exact path="/currencies" component={Currencies} />
        <Route path="/currencies/:currency" component={Currencies} />
      </BrowserRouter>
    </div>
  );
}

export default App;
