import { BrowserRouter, Route } from 'react-router-dom';
import './App.scss';
import Navigation from './components/Navigation';
import Accounts from './pages/Accounts';
import Blocks from './pages/Blocks';
import Currencies from './pages/Currencies';
import Operations from './pages/Operations';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Route exact path="/" component={Blocks} />
        <Route path="/blocks" component={Blocks} />
        <Route path="/accounts" component={Accounts} />
        <Route path="/operations" component={Operations} />
        <Route path="/currencies" component={Currencies} />
      </BrowserRouter>
    </div>
  );
}

export default App;
