import React, {Component} from 'react';
import {observer} from "mobx-react";
import {ProgramOrganizer} from "react-program-organizer";

class App extends Component {
    render() {
        const {store} = this.props;

        return (
            <div className="App">
                <ProgramOrganizer store={store} programCategories={store.programCategories}/>

            </div>
        );
    }
}

observer(App);
export default App;
