import React from 'react';
import {observer} from "mobx-react";

export default class PageStepper extends React.Component {
    constructor(props) {
        super(props);
    }

    prev(e) {
        const {store} = this.props;
        let n = -1;
        if (e.ctrlKey) {
            n *= 10;
        }
        if (e.shiftKey) {
            n *= 10;
        }
        store.uiStore.setCurrentStudyPoint(store.uiStore.studyPoints.current + n);
    }

    next(e) {
        const {store} = this.props;
        let n = 1;
        if (e.ctrlKey) {
            n *= 10;
        }
        if (e.shiftKey) {
            n *= 10;
        }
        store.uiStore.setCurrentStudyPoint(store.uiStore.studyPoints.current + n);
    }

    render() {
        const {store} = this.props;
        return (
            <div className="PageStepper">

                <div className="back-next no-text">
                    <a className="ss-button white back" onClick={(e) => this.prev(e)}/>
                    <span className={'active-page'}>{store.uiStore.studyPoints.current + 1}</span>
                    <span> of {store.uiStore.studyPoints.count}</span>
                    <a className="ss-button white next" onClick={(e) => this.next(e)}/>
                </div>
            </div>
        );
    }
}

observer(PageStepper);