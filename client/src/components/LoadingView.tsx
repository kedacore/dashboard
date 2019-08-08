import React from 'react';
import { CircularProgress } from '@material-ui/core';

export default class LoadingView extends React.Component<{}> {
    render() {
        return <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '80vh'}}><CircularProgress/></div>;
    }
}