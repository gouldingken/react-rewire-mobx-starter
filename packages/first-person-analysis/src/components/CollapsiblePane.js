import React from 'react';
import {observer} from "mobx-react";
import {If} from "sasaki-core";

export default class CollapsiblePane extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {title, store, panelId, backgroundColor, initCollapsed} = this.props;
        const collapsed = store.uiStore.getPanelState(panelId, initCollapsed).collapsed;
        const style = {};
        if (backgroundColor) {
            style.background = backgroundColor;
        }
        return (
            <div className="CollapsiblePane">
                <div className={'header'} style={style} onClick={() => {
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