import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {SpeckleData} from "speckle-direct";
import PolyOffset from "./geometry/PolyOffset";
import Interop from "./Interop";
import SceneData from "./SceneData";
import MainStore from "./store/MainStore";
import MockCommands from "./mocks/MockCommands";

const store = new MainStore();
ReactDOM.render(<App store={store}/>, document.getElementById('root'));

store.sceneData = new SceneData(store);

window.Interop = new Interop(store.sceneData);

new MockCommands(store, window.Interop);
//load 'C:\Users\kgoulding\Documents\Development\Ruby\SpeckleRuby\speckle_ruby_sketchup_direct\ui\speckle_view.rb'

serviceWorker.unregister();

