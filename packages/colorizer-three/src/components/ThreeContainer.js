import React from 'react';
import {observer} from "mobx-react";
import ThreeApp from "../three/ThreeApp";

export default class ThreeContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {dataHandler} = this.props;
        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        this.threeApp = new ThreeApp(this.mount, dataHandler);
    }

    componentWillUnmount() {
        this.threeApp.stop();
        this.mount.removeChild(this.threeApp.renderer.domElement)
    }

    render() {
        return (
            <div ref={(mount) => {
                this.mount = mount
            }} className="ThreeContainer">

            </div>
        );
    }
}
observer(ThreeContainer);