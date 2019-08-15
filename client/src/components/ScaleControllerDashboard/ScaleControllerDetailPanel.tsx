import React from 'react';
import { Paper, Typography, Grid, Chip, Box, Divider } from '@material-ui/core';
import { V1Deployment } from '@kubernetes/client-node';

function handleClick() { }

function listChips(detailName: string, list: Object) {
    let listObject = JSON.parse(JSON.stringify(list));
    let listItems: string[] = [];

    for (let key in listObject) {
        listItems.push(key);
    }

    switch(detailName) {
        case "Annotations": {
            return listItems.map((item, index) => <Chip label={item} onClick={handleClick} key={index} />);
        }
        case "Selector": {
            listObject = listObject["matchLabels"];
            listItems = [];
            
            for (let key in listObject) {
                listItems.push(key);
            }
            return listItems.map((item, index) => <Chip label={item + ": " + listObject[item]}  onClick={handleClick} key={index}/>)
        }
        default: {
            return listItems.map((item, index) => <Chip label={item + ": " + listObject[item]} onClick={handleClick} key={index}/>);
        }
    }
}

const ScaleControllerDetail: React.FunctionComponent<{ detailName: string, detailValue?: any, detailValueList?: any}> = (props) => {
    let valueDisplay = null;

    if (props.detailValue) {
        valueDisplay = <Typography>{ props.detailValue }</Typography>
    } else if (props.detailValueList) {
        valueDisplay = listChips(props.detailName, props.detailValueList);
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={6} md={3} lg={3}>
                <Typography style={{fontWeight:'bold'}}> { props.detailName + ":" } </Typography>
            </Grid>
            <Grid item xs={6} md={9} lg={9}>
                { valueDisplay }
            </Grid>
        </Grid>
    );
};

const ScaleControllerDetailPanel: React.FunctionComponent<{ deployment: V1Deployment, scaleDecisionTime: string}> = (props) => {
    return (
        <Paper>
            <Box p={4}>
                <Typography variant="h6" id="Details">Details</Typography>
                <Divider /> <br/>

                <ScaleControllerDetail detailName={"Name"} detailValue={props.deployment.metadata!.name}></ScaleControllerDetail>
                <ScaleControllerDetail detailName={"Namespace"} detailValue={props.deployment!.metadata!.namespace}></ScaleControllerDetail>
                <ScaleControllerDetail detailName={"Labels"} detailValueList={ props.deployment!.metadata!.labels}></ScaleControllerDetail>
                <ScaleControllerDetail detailName={"Annotations"} detailValueList={props.deployment!.metadata!.annotations}></ScaleControllerDetail>
                <ScaleControllerDetail detailName={"Selector"} detailValueList={props.deployment.spec!.selector}></ScaleControllerDetail>
                <ScaleControllerDetail detailName={"Creation Time"} detailValue={props.deployment.metadata!.creationTimestamp}></ScaleControllerDetail>
                <ScaleControllerDetail detailName={"Last Scale Time"} detailValue={(props.scaleDecisionTime !== "") ? props.scaleDecisionTime:"not available"}></ScaleControllerDetail>
            </Box>
        </Paper>
    );
}

export default ScaleControllerDetailPanel;
