import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import MainStore from "./MainStore";

const store = new MainStore();
ReactDOM.render(<App store={store}/>, document.getElementById('root'));
//
fetch('./assets/data/moveSets.json').then(function (response) {
    return response.json();
}).then((data) => {
    store.setMoveSetsByOption(data);
}).catch(function(e) {
    console.log("error");
});
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

