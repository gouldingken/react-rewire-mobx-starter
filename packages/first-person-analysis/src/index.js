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
import ViewsDataHandler from "./ViewsDataHandler";
import DeepLinking from "./DeepLinking";

const store = new MainStore();
const dataHandler = new ViewsDataHandler(store);

store.sceneData = new SceneData(store, dataHandler);

window.Interop = new Interop(store.sceneData);

// new DeepLinking(store);

// new MockCommands(store, window.Interop, dataHandler);

//load 'C:\Users\kgoulding\Documents\Development\Ruby\SpeckleRuby\speckle_ruby_sketchup_direct\ui\speckle_view.rb'
//SpeckleView.new.show_web_dialog

ReactDOM.render(<App store={store} dataHandler={dataHandler}/>, document.getElementById('root'));


serviceWorker.unregister();

