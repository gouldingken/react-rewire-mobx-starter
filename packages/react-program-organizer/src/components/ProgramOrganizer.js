import React from 'react';
import {observer} from "mobx-react";
import ProgramCategory from "./ProgramCategory";

export default class ProgramOrganizer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {store, programCategories} = this.props;
        return (
            <div className="ProgramOrganizer">
                {programCategories.map((category) =>
                    <ProgramCategory key={category.key} store={store} category={category}/>
                )}
            </div>
        );
    }
}

observer(ProgramOrganizer);