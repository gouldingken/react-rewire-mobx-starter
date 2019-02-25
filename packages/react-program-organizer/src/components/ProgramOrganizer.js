import React from 'react';
import {observer} from "mobx-react";
import ProgramCategory from "./ProgramCategory";
import {If} from "sasaki-core";;
import EditDetails from "./edit/EditDetails";

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
                <If true={store.interactionStore.editingDetail}>
                    <EditDetails store={store} details={store.interactionStore.editingDetail}/>
                </If>
            </div>
        );
    }
}

observer(ProgramOrganizer);