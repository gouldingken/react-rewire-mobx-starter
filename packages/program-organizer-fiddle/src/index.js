import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {ProgramStore} from "react-program-organizer";

const store = new ProgramStore();
store.setProgramCategories([
    {
        title: 'Basketball Arena', blocks: [
            {
                title: 'Basketball Seating',
                sliderValue: 10,
                details: [
                    {title: 'Basketball Seating', count:1, area:7000},
                ]
            }
        ]
    }, {
        title: 'Offices', blocks: [
            {
                title: 'Football Suite',
                subtitle: 'Phase 1',
                sliderValue: 10,
                details: [
                    {title: 'Head Coach', count:1, area:180},
                    {title: 'Assistant Coach', count:10, area:120},
                ]
            },
            {
                title: 'Football Suite',
                subtitle: 'Phase 2',
                sliderValue: 10,
                details: [
                    {title: 'Another Coach', count:1, area:180},
                    {title: 'Another Assistant or Two', count:3, area:120},
                ]
            }
        ]
    }
]);
ReactDOM.render(<App store={store}/>, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

