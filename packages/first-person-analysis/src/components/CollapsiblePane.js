import React from 'react';
import {observer} from "mobx-react";
import {If} from "sasaki-core";

export default class CollapsiblePane extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {title, store, panelId} = this.props;
        const collapsed = store.uiStore.getPanelState(panelId).collapsed;
        return (
            <div className="CollapsiblePane">
                <div className={'header'} onClick={() => {
                    store.uiStore.togglePanelCollapsed(panelId);
                }}>
                    {title}
                </div>
                <If true={!collapsed}>
                    <div className={'content'}>
                        {this.props.children}
                    </div>
                </If>
            </div>
        );
    }
}

observer(CollapsiblePane);