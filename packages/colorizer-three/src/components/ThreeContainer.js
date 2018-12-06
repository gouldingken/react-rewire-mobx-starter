import React from 'react';
import {observer} from "mobx-react";
import ThreeApp from "../three/ThreeApp";

export default class ThreeContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {dataHandler, useShadows} = this.props;
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        this.threeApp = new ThreeApp(this.mount, dataHandler, {useShadows:useShadows});
        this.threeApp.on('objects-ready', () => {
            const {previousOption, activeOption, inclusionList, highlightIds} = this.props;
            this.updateTweenObjects(inclusionList, previousOption, activeOption);
            this.updateHighlightObjects(highlightIds);
        });
    }

    componentWillUnmount() {
        this.threeApp.stop();
        this.mount.removeChild(this.threeApp.renderer.domElement)
    }

    render() {
        const {store, previousOption, activeOption, inclusionList, highlightIds, dataHandler} = this.props;
        if (this.threeApp) {
            this.updateTweenObjects(inclusionList, previousOption, activeOption);
            this.updateHighlightObjects(highlightIds);
        }
        return (
            <div ref={(mount) => {
                this.mount = mount
            }} className="ThreeContainer">

            </div>
        );
    }

    updateTweenObjects(inclusionList, previousOption, activeOption) {
        this.threeApp.tweenObjects.forEach((tweenObj, i) => {
            const include = !inclusionList || inclusionList.indexOf(tweenObj.name) >= 0;
            tweenObj.setTweenSet(previousOption, activeOption, include);
        });
    }

    updateHighlightObjects(highlightIds) {
        this.threeApp.materialObjects.forEach((materialObj, i) => {
            const highlight = !highlightIds || highlightIds.indexOf(materialObj.id) >= 0;
            materialObj.setHighlight(highlight);
        });
    }
}
observer(ThreeContainer);