import logo from './logo.svg';
import './App.css';
// import ThreeScene from './mycomp';
// import ThreeScene_2D from './nw_2d.js';
import ThreeScene_3D from './nw_3d.js';
import Intro from './app/intro.js'
import Picfetch from './app/pic.js';
import Abc from './app/test.js';
// import ForceGraph3DComponent from './data';
// import ForceGraph3DComponent_1 from './data1.js';

function App() {
  // const [gData, setGData] = useState({ nodes: [], links: [] });
  const id = "00001";
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      {/* <Intro/> */}
      {/* <div>nihao</div> */}
      {/* <ThreeScene/> */}
      {/* <ThreeScene_2D/> */}
      <ThreeScene_3D/>
      {/* <Abc/> */}
      {/* <Picfetch id={id}/> */}
      {/* <ForceGraph3DComponent /> */}
      {/* <ForceGraph3DComponent_1/> */}
    </div>
  );
}

export default App;
