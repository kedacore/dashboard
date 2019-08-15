import React from 'react';
import { Typography, Paper, Box } from '@material-ui/core';
import { ResponsiveBar } from '@nivo/bar';

export default class ReplicaDisplay extends React.Component<{scaledObjectName: string, namespace:string}, {dataset: {[key: string]: any}[], logs: string}> {
    private numBarsInGraph:number = 100;

    constructor(props: {scaledObjectName: string, namespace:string}) {
        super(props);

        this.state = {
            dataset: [],
            logs: ""
        }
    }

    getMetricsFromLogs(text: string, name: string, namespace: string) {
        let logs = text.split("\n");
        let dataset: {[key: string]: number}[] = [];

        let totalReplicas = 0;

        // (logs.length-1)%10
        for (let i = 0; i < logs.length; i+=1) {            
            let splitLogRegex = new RegExp("(time|level|msg)=");
            let scaledObjectLogRegex = new RegExp(`${namespace}/${name}|keda-hpa-${name}`);
            let removeDoubleQuotes = new RegExp("['\"]+");

            if (scaledObjectLogRegex.test(logs[i])) {
                let metricsInLog: {[key: string]: any} = {};
                let logComponents = logs[i].split(splitLogRegex);
                let metricInfo = logComponents[6].replace(removeDoubleQuotes, "").replace(removeDoubleQuotes, "").trim().split("; ");
                let timestamp = logComponents[2].replace(removeDoubleQuotes, "").replace(removeDoubleQuotes, "").trim();

                totalReplicas = Number(metricInfo[2].split(": ")[1].trim());

                if (dataset.length > this.numBarsInGraph) {
                    while (dataset.length > this.numBarsInGraph) {
                        dataset.shift();
                    }
                }
                
                metricsInLog['timestamp'] = timestamp;
                metricsInLog[name] = totalReplicas;
                dataset.push(metricsInLog);

            }
        }

        return dataset;
    }

    async componentDidMount() {
        await fetch('/api/logs/metrics')
            .then(res => res.text().then(text => 
                { this.setState( {logs: text }) }));

        this.setState({dataset: this.getMetricsFromLogs(this.state.logs, this.props.scaledObjectName, this.props.namespace)});

        try {
            setInterval(async() => {
                await fetch('/api/logs/metrics')
                .then(res => res.text().then(text => 
                    { this.setState( {logs: text }) }));

                this.setState({dataset: this.getMetricsFromLogs(this.state.logs, this.props.scaledObjectName, this.props.namespace)});
            }, 30000);
        } catch(e) {
            console.log(e);
        }
    }

    componentWillUnmount() {
    }
    
    render() {

        return (
            <Paper>
                <Box p={4}>
                    <Typography variant="h6" id="Replica Count">Replicas</Typography>
                    <div style={{ height: 400 }}>
                        <ResponsiveBar
                            data={this.state.dataset}
                            keys={[this.props.scaledObjectName]}
                            indexBy="timestamp"
                            margin={{ top: 20, right: 0, bottom: 20, left: 20 }}
                            padding={0.3}
                            colors={{ scheme: 'paired' }}
                            axisTop={null}
                            axisRight={null}
                            axisBottom={
                            //     {
                            //     tickSize: 5,
                            //     tickPadding: 5,
                            //     tickRotation: 32,
                            //     tickValues: 10,
                            //     legend: 'timestamp',
                            //     legendPosition: 'middle',
                            //     legendOffset: 92
                            // }
                            null
                            }
                            axisLeft={{
                                tickSize: 5,
                                tickPadding: 0,
                                tickRotation: 0,
                                tickValues: 10,
                                legend: 'replicas',
                                legendPosition: 'middle',
                                legendOffset: -40
                            }}
                            labelSkipWidth={12}
                            labelSkipHeight={12}
                            labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
                            enableGridY={true}
                            animate={true}
                            motionStiffness={90}
                            motionDamping={15}
                        />
                    </div>
                </Box>
            </Paper>
        );
    }
}