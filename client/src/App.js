import './App.css';
import 'bootstrap/dist/css/bootstrap.css'
import Home from "./views/Home";
import Header from "./components/Header"
function App() {
  return (
    <div className="App">
      <Header />
       <Home />
    </div>
  );
}

export default App;
