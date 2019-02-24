import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {SpeckleData} from "speckle-direct";
import MainStore from "./store/MainStore";

const store = new MainStore();
ReactDOM.render(<App store={store}/>, document.getElementById('root'));

serviceWorker.unregister();

