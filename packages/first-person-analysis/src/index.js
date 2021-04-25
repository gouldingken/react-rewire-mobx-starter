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

//TEMP add options for rotated context for testing views on a street angle
for (let i = 0; i < 8; i++) {//this gets called before the callback above
    store.optionsStore.addOption();
}

new MockCommands(store, window.Interop, dataHandler, () => {
    for (let i = 1; i <= 10; i++) {
        store.optionsStore.updateOption(`option-${i}`, {
            name: `Angle ${i * 30}`, onSelect: () => {
                const angle = Math.PI * i * 30 / 180;
                Object.keys(store.targetStore.viewTargets).forEach((k) => {
                    let viewTarget = store.targetStore.viewTargets[k];
                    if (viewTarget.threeObjects) {
                        viewTarget.threeObjects.forEach((obj, i) => {
                            // console.log(obj.rotation.x, obj.rotation.y, obj.rotation.z);
                            obj.rotation.set(obj.rotation.x, 0, angle);
                        });
                    }
                });
            }
        });
    }
});

//load 'C:\Users\kgoulding\Documents\Development\Ruby\SpeckleRuby\speckle_ruby_sketchup_direct\ui\speckle_view.rb'
//SpeckleView.new.show_web_dialog

ReactDOM.render(<App store={store} dataHandler={dataHandler}/>, document.getElementById('root'));


serviceWorker.unregister();

