import React from 'react';
import { ScaledObjectModel } from '../../models/ScaledObjectModel';
import { CssBaseline } from '@material-ui/core';
import LoadingView from '../LoadingView';
import SideBarNav from '../SideBarNav';
import ScaledObjectsTable from './ScaledObjectsTable';

export default class ScaledObjectsDashboard extends React.Component<{}, {loaded: boolean, scaledObjects:ScaledObjectModel[]}> {
    constructor(props: {}) {
        super(props);

        this.state = {
            loaded: false,
            scaledObjects: []
        };
    }

    async componentDidMount() {
        await fetch('/api/scaledobjects')
        .then(res => res.json())
        .then(({ items }) => this.setState({ scaledObjects: items }));

        this.setState({ loaded:true });
    }

    componentWillUnmount() {
        
    }

    render() {
        if (this.state.loaded) {
            let table = <ScaledObjectsTable scaledObjects={this.state.scaledObjects}/>
            let breadcrumbLinks = [
                {text: 'Scaled Objects', link: '/scaled-objects'}
            ];

            return (
                <React.Fragment>
                    <CssBaseline /> 
                    <SideBarNav content={table} breadcrumbs={breadcrumbLinks}></SideBarNav>         
                </React.Fragment>
            );
        } else {
            return <LoadingView></LoadingView>
        }
    }
}