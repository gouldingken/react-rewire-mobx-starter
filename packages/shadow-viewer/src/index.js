import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import MainStore from "./store/MainStore";

const store = new MainStore();
ReactDOM.render(<App store={store}/>, document.getElementById('root'));

document.addEventListener('keypress', (e) => {
    console.log(e.key);
    const {uiStore} = store;

    if (e.key === '.') {
        uiStore.setSelectedMinute(uiStore.selectedMinute + 3)
    }
    if (e.key === ',') {
        uiStore.setSelectedMinute(uiStore.selectedMinute - 3)
    }
});


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

