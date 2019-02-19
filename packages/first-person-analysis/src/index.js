import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {SpeckleData} from "speckle-direct";
import PolyOffset from "./geometry/PolyOffset";
import Interop from "./Interop";
import SceneData from "./SceneData";

const store = {};
ReactDOM.render(<App store={store}/>, document.getElementById('root'));

const sceneData = new SceneData();

// const offsetPoints = PolyOffset.test();
// window.threeAppInstance.addPoints(offsetPoints.map((pt)=> {
//     return [pt[0], pt[1], polyOffset.zPos];
// }));

window.Interop = new Interop(sceneData);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

