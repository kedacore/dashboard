import React from 'react';
import { Paper, Box, Typography, Table, TableCell, TableBody, TableRow, TableHead, Grid } from '@material-ui/core';
import { LogModel } from '../../models/LogModel';
import Error from '@material-ui/icons/Error';
import CheckCircle from '@material-ui/icons/CheckCircle';
import WarningRounded from '@material-ui/icons/WarningRounded';

const ScaledObjectLogRow: React.FunctionComponent<{ log: LogModel }> = (props) => {
    let icon = <CheckCircle style={{color: '#4caf50'}}></CheckCircle>;

    if (props.log.infoLevel === "error") {
        icon = <Error color="error"></Error>
    } else if (props.log.infoLevel === "warning") {
        icon = <WarningRounded style={{color: '#fdd835'}}></WarningRounded>
    }


    return (
        <TableRow key={props.log.timestamp}>
            <TableCell align="left"> { icon }</TableCell>
            <TableCell align="left"> {`${props.log.inputMetric}`} </TableCell>
            {/* <TableCell align="left">{props.log.source}</TableCell> */}
            <TableCell align="left">{props.log.timestamp}</TableCell>
            <TableCell align="left">{props.log.msg}</TableCell>
        </TableRow>
    );
};

export default class ScaledObjectLogPanel extends React.Component<{logs: LogModel[]}, {}> {
    render() {
        return (
            <Paper>
                <Box p={4}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={12} lg={12}>
                            <Typography variant="h6">Events</Typography>
                        </Grid>
                    </Grid>
                    
                    <Table size="small">
                        <TableHead>
                            <TableRow key={'header-row'}>
                                <TableCell align="left">Status</TableCell>
                                <TableCell align="left">Input Metric</TableCell>
                                {/* <TableCell align="left">Source</TableCell> */}
                                <TableCell align="left">Time Stamp</TableCell>
                                <TableCell align="left">Scaling Decision</TableCell>
                            </TableRow>
                        </TableHead>
                        
                        <TableBody>
                            { this.props.logs.map((log, index) => <ScaledObjectLogRow key={index} log={log}/> )}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>
        );
    }
}