import React from 'react';
import { Paper, Typography, Divider, Grid, Box } from '@material-ui/core';
import { V1HorizontalPodAutoscaler } from '@kubernetes/client-node';


const ScaleTargetDetail: React.FunctionComponent<{ detailName: string, detailValue: any}> = (props) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={6} md={3} lg={3}>
                <Typography style={{fontWeight:'bold'}}> { props.detailName + ":" } </Typography>
            </Grid>
            <Grid item xs={6} md={9} lg={9}>
                <Typography>{ props.detailValue }</Typography>
            </Grid>
        </Grid>
    );
};

export default class ScaleTargetPanel extends React.Component<{hpa:V1HorizontalPodAutoscaler}, {}> {
    render() {
        return (
            <Paper>
                <Box p={4}>
                    <Typography variant="h6" id="scale-target-detail"> Scale Target</Typography>
                    <Divider /> <br/>

                    <ScaleTargetDetail detailName={"Reference"} detailValue={ (this.props.hpa.spec !== undefined) ? 
                                           this.props.hpa.spec.scaleTargetRef.kind + "/" + this.props.hpa.spec.scaleTargetRef.name: "not found"} />
                    <ScaleTargetDetail detailName={"HPA Definition"} detailValue={ (this.props.hpa.metadata !== undefined) ? this.props.hpa.metadata!.name:"not found" } />
                    <ScaleTargetDetail detailName={"Min replicas"} detailValue={(this.props.hpa.spec !== undefined) ? this.props.hpa.spec!.minReplicas:"0" } />
                    <ScaleTargetDetail detailName={"Max replicas"} detailValue={ (this.props.hpa.spec !== undefined) ? this.props.hpa.spec!.maxReplicas:"0"} />
                    <ScaleTargetDetail detailName={"Deployment pods"} detailValue={ (this.props.hpa.status !== undefined) ? 
                                            this.props.hpa.status.currentReplicas + " current / " + this.props.hpa.status.desiredReplicas + " desired": "not found" } />
                </Box>
            </Paper>
        );
    }
}