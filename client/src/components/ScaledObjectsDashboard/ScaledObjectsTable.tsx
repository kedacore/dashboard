import React from 'react';
import { ScaledObjectModel } from '../../models/ScaledObjectModel';
import { Grid, Paper, Typography, Table, TableCell, TableBody, TableRow, TableHead, Box } from '@material-ui/core';
import { V1HorizontalPodAutoscaler, V1Deployment } from '@kubernetes/client-node';

class ScaledObjectRow extends React.Component<{ scaledObject: ScaledObjectModel }, { hpa: V1HorizontalPodAutoscaler, deployment: V1Deployment }> {
    constructor(props: { scaledObject: ScaledObjectModel }) {
        super(props);

        this.state = {
            hpa: new V1HorizontalPodAutoscaler(),
            deployment: new V1Deployment()
        };
    }

    async componentDidMount() {
        await fetch(`/api/namespace/${this.props.scaledObject.metadata.namespace}/hpa/keda-hpa-${this.props.scaledObject.metadata.name}`)
        .then(res => res.json())
        .then((json) => this.setState({ hpa: json }));

        await fetch(`/api/namespace/${this.props.scaledObject.metadata.namespace}/deployment/${this.props.scaledObject.metadata.name}`)
        .then(res => res.json())
        .then((json) => this.setState({ deployment: json }));
    }

    render() {
        return (
            <TableRow key={new Date().getTime()}>
                {/* Namespace, Name, Replicas, Last Active Time, Triggers, HPA Definition, HPA Reference */}
                <TableCell align="left"> { this.props.scaledObject.metadata.namespace }</TableCell>
                <TableCell align="left">{ this.props.scaledObject.metadata.name }</TableCell>
                <TableCell align="left">{ (this.state.hpa.status !== undefined) ? 
                                            `(${this.state.hpa.status.currentReplicas}/${this.state.hpa.status.desiredReplicas})`: "not found" }</TableCell>
                <TableCell align="left">{ (this.state.deployment.status && this.state.deployment.status.conditions && this.state.deployment.status!.conditions.length > 0) ?
                     this.state.deployment.status!.conditions[this.state.deployment.status!.conditions.length - 1].lastUpdateTime:"not available" }</TableCell>
                <TableCell align="left">{ this.props.scaledObject.spec.triggers[0].type}</TableCell>
                <TableCell align="left">{ "keda-hpa-" + this.props.scaledObject.metadata.name}</TableCell>
                <TableCell align="left">{ (this.state.hpa.spec !== undefined) ? 
                                            `${this.state.hpa.spec.scaleTargetRef.kind }/${this.state.hpa.spec.scaleTargetRef.name}`: "not found"}</TableCell>
            </TableRow>
        );
    }
};

export default class ScaledObjectsTable extends React.Component<{scaledObjects: ScaledObjectModel[] }, {}> {
    render() {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={12} lg={12}>
                    <Paper>
                        <Box p={4}>
                        <Typography variant="h5"> Scaled Objects</Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left">Namespace</TableCell>
                                    <TableCell align="left">Name</TableCell>
                                    <TableCell align="left">Replicas (current/desired)</TableCell>
                                    <TableCell align="left">Last Active Time</TableCell>
                                    <TableCell align="left">Triggers</TableCell>
                                    <TableCell align="left">HPA Definition</TableCell>
                                    <TableCell align="left">HPA Reference</TableCell>
                                </TableRow>
                            </TableHead>
                            
                            <TableBody>
                                {this.props.scaledObjects
                                        .map((o, index) => <ScaledObjectRow scaledObject={o} key={index}/>)}
                            </TableBody>
                        </Table>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        );
    }
}
