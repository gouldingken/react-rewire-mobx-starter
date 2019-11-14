import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import MainStore from "./MainStore";
import {FilePersist} from "colorizer-three";

const store = new MainStore();
ReactDOM.render(<App store={store}/>, document.getElementById('root'));
//
fetch('./assets/data/moveSets.json').then(function (response) {
    return response.json();
}).then((data) => {
    store.setMoveSetsByOption(data);
    // setTimeout(()=> { //NOTE this requires a modification in three-full:36124 --- if ( material.map && material.map.image ) {//KG MOD
    //         FilePersist.saveScene(window.threeAppInstance.scene, (data)=> {
    //             FilePersist.saveString(data, 'morph.gltf');
    //             console.log('SAVED scene');
    //         });
    //     }
    // , 3000)

}).catch(function(e) {
    console.log("error");
});
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

