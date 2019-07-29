import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {SpeckleData} from "speckle-direct";
import MainStore from "./store/MainStore";
import TopoSampler from "./geometry/TopoSampler";

const store = new MainStore();

const speckleData = new SpeckleData({scale: 0.1});

const img = new Image();
img.src = "./topo-small.png";
img.onload = function () {
    const topoSampler = new TopoSampler(img);
    topoSampler.generate();
    const mesh = speckleData.getMesh(topoSampler.triangulate(3));
    window.threeAppInstance.addObjects([mesh]);
};

ReactDOM.render(<App store={store}/>, document.getElementById('root'));

serviceWorker.unregister();

