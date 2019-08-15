import React from 'react';
import { CssBaseline, Typography, Grid, Box } from '@material-ui/core';

export default class NotFound extends React.Component<{}> {
    render() {
        return (
            <React.Fragment>
                <CssBaseline /> 
                <Box p={3}>
                    <Grid container
                          justify = "center"
                          style={{
                            position: 'absolute', 
                            top: '35%',
                            }}>
                        <Grid item xs={12} md={12} lg={12}>
                            <Typography align="center" variant="h1">404 Error</Typography>
                            <Typography align="center" variant="h3">Oops! That page can’t be found.</Typography>
                            <Typography align="center" variant="h5"> It looks like nothing was found at this location. <br></br> 
                            Maybe try to press back to go to the previous page?</Typography>
                        </Grid>
                    </Grid>     
                </Box>
   
            </React.Fragment>
        );
    }
}