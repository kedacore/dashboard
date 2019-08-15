import React from 'react';
import { Grid } from '@material-ui/core';
import { RouteComponentProps } from 'react-router-dom';
import {ScaledObjectModel } from '../../models/ScaledObjectModel';
import { LogModel } from '../../models/LogModel';
import { V1HorizontalPodAutoscaler, V1Deployment } from '@kubernetes/client-node';
import SideBarNav from '../SideBarNav';
import LoadingView from '../LoadingView';
import ReplicaDisplay from './ReplicaDisplay';
import ScaledObjectDetailPanel from './ScaledObjectDetailPanel';
import TriggerTable from './TriggerTable';
import ScaleTargetPanel from './ScaleTargetPanel';
import ScaledObjectLogPanel from './ScaledObjectLogPanel';


interface ScaledObjectDetailsDashboardProps extends RouteComponentProps<{ namespace: string, name: string }> {

}

export default class ScaledObjectDetailsDashboard extends React.Component<ScaledObjectDetailsDashboardProps, { loaded: boolean, name:string, 
    namespace: string, scaledObject:ScaledObjectModel, deployment:V1Deployment, hpa: V1HorizontalPodAutoscaler, logs: LogModel[], lastActiveTime: string }> {

    constructor(props: ScaledObjectDetailsDashboardProps) {
        super(props);

        this.state = {
            loaded: false,
            name: this.props.match.params.name,
            namespace: this.props.match.params.namespace,
            scaledObject: new ScaledObjectModel(),
            deployment: new V1Deployment(),
            hpa: new V1HorizontalPodAutoscaler(),
            logs: [],
            lastActiveTime: "",
        };
    }

    private roundUpTimestamp(timestamp: string) {
        let roundedTimestamp = timestamp.slice(0, -4);

        if (Number(timestamp.slice(-3, -2)) >= 0) {
            if (Number(roundedTimestamp.slice(-1)) === 9) {
                roundedTimestamp = `${roundedTimestamp.slice(0, -2)}${Number(roundedTimestamp.slice(-2, -1)) + 1}0`;
            } else {
                roundedTimestamp = `${roundedTimestamp.slice(0, -1)}${Number(roundedTimestamp.slice(-1)) + 1}`;
            }
        }

        return roundedTimestamp;
    }

    private async getLogs() {
        let pod = await fetch('/api/keda/pod')
                .then(res => res.json())
                .then(({ items }) => {
                    if (items.length > 0) {
                        return items[0];
                }});

        await fetch(`/api/namespace/${pod.metadata.namespace}/pods/${pod.metadata.name}/logs`)
                .then(res => res.text())
                .then(logs => this.formatLogs(logs, pod.metadata.name, pod.metadata.namespace))
                
    }

    private formatLogs(text: string, name: string, namespace: string) {
        let logs = text.split("\n");
        let scaledObjectLogs: LogModel[] = [];
        let lastActiveTime: string = "";
        let scaleDecisions:{[key:string]: LogModel} = {};

        for (let i = 0; i < logs.length; i++) {
            let log = logs[i];

            let searchLogRegex = new RegExp("time.*level.*msg");
            let splitLogRegex = new RegExp("(time|level|msg)=");
            let scaledObjectLogRegex = new RegExp(`${namespace}/${name}|keda-hpa-${name}`);
            let replicaMetricsRegex = new RegExp("(Metric Type: Replica Count;) ((Scaled Object|Current Replicas): .*;)");
            let externalMetricsRegex = new RegExp("(Metric Type: Input Metric;) ((Scaled Object|Metric Name|Metric Value):.*);");
            let removeDoubleQuotes = new RegExp("['\"]+");
            let scaleDecisionRegex = new RegExp("AbleToScale: .*")
            
            // putting together log that will show up in log panel
            if (searchLogRegex.test(log) && scaledObjectLogRegex.test(log) && !replicaMetricsRegex.test(log) && !externalMetricsRegex.test(log)) {
                let logComponents = log.split(splitLogRegex);
                let scaledObjectLog = new LogModel();
                scaledObjectLog.msg = logComponents[6].replace(removeDoubleQuotes, "").replace(removeDoubleQuotes, "").trim();
                scaledObjectLog.source = logComponents[4].trim();
                scaledObjectLog.timestamp =  logComponents[2].replace(removeDoubleQuotes, "").replace(removeDoubleQuotes, "").trim();
                scaledObjectLog.infoLevel = logComponents[4].trim();
                
                // update last scale time and store the scale decision in a dictionary (to be updated later)
                if (scaleDecisionRegex.test(scaledObjectLog.msg)) {
                   lastActiveTime = scaledObjectLog.timestamp;
                   this.setState({ lastActiveTime: lastActiveTime });
                
                   let roundedTimestamp = this.roundUpTimestamp(scaledObjectLog.timestamp);
                   scaleDecisions[roundedTimestamp] = scaledObjectLog;

                } 

                scaledObjectLogs.push(scaledObjectLog);
            } 
            // getting external metrics from logs - find the scale decision in the dictionary and modify the log to include the timestamp
            else if (searchLogRegex.test(log) && scaledObjectLogRegex.test(log) && externalMetricsRegex.test(log)) {
                let logComponents = log.split(splitLogRegex);
                let msg = logComponents[6].replace(removeDoubleQuotes, "").replace(removeDoubleQuotes, "").trim();

                let metricValue = Number(msg.split("; ")[3].split(": ")[1]);
                let timestamp = this.roundUpTimestamp(logComponents[2].replace(removeDoubleQuotes, "").replace(removeDoubleQuotes, "").trim());

                if (scaleDecisions[timestamp] && scaleDecisions[timestamp].inputMetric <= metricValue) {
                    scaleDecisions[timestamp].inputMetric = metricValue;
                    console.log(metricValue, scaleDecisions[timestamp]);
                }

            }
        }

        return scaledObjectLogs;
    }

    async componentDidMount() {
        await fetch(`/api/namespace/${this.state.namespace}/deployment/${this.state.name}`)
            .then(res => res.json())
            .then(data => { 
                let deploy = new V1Deployment();
                deploy.metadata = data.metadata;
                deploy.spec = data.spec;
                deploy.status = data.status;
                this.setState({ deployment: deploy }); 
        });

        await fetch(`/api/namespace/${this.state.namespace}/scaledobjects/${this.state.name}`)
            .then(res => res.json())
            .then(data => this.setState({ scaledObject: data }));

        await fetch(`/api/namespace/${this.state.namespace}/hpa/keda-hpa-${this.state.name}`)
            .then(res => res.json())
            .then((json) => this.setState({ hpa: json }));
        
        await fetch('/api/logs')
            .then(res => res.text().then(text => { 
                this.setState( {logs:  this.formatLogs(text, this.state.name, this.state.namespace)} );
            }));

        this.setState({ loaded: true });

        try {
            setInterval(async() => {
                await fetch('/api/logs')
                .then(res => res.text().then(text => 
                    { this.setState( {logs: this.formatLogs(text, this.state.name, this.state.namespace) }) }));
            }, 5000);
        } catch(e) {
            console.log(e);
        }
    }

    componentWillUnmount() {      
    }

    getDetailDashboard() {
        return (
            <div>
                <Grid container spacing={5}>
                    <Grid item xs={12} md={12} lg={12}>
                        <ScaledObjectDetailPanel deployment={this.state.deployment} scaledObject={this.state.scaledObject} lastActiveTime={this.state.lastActiveTime}></ScaledObjectDetailPanel>                    
                    </Grid>
                </Grid>
                
                <Grid container spacing={5}>
                    <Grid item xs={12} md={12} lg={12}>
                        <ReplicaDisplay scaledObjectName={this.props.match.params.name} namespace={this.props.match.params.namespace}></ReplicaDisplay>            
                    </Grid>
                </Grid>

                <Grid container spacing={5}>
                    <Grid item xs={12} md={12} lg={12}>
                        <ScaleTargetPanel hpa={this.state.hpa}></ScaleTargetPanel>            
                    </Grid>
                </Grid>

                <Grid container spacing={5}>
                    <Grid item xs={12} md={12} lg={12}>
                        <TriggerTable scaledObject={this.state.scaledObject}></TriggerTable>            
                    </Grid>
                </Grid>

                <Grid container spacing={5}>
                    <Grid item xs={12} md={12} lg={12}>
                        <ScaledObjectLogPanel logs={this.state.logs}> </ScaledObjectLogPanel>            
                    </Grid>
                </Grid>

            </div>
        );
    }
    
    render() {
        let breadcrumbLinks = [
            {text: 'Scaled Objects', link: '/scaled-objects'},
            {text: this.state.name, link: '/scaled-objects/namespace/' + this.state.namespace + '/scaled-object/' + this.state.name}
        ];

        if (this.state.loaded) {
            return <SideBarNav content={this.getDetailDashboard()} breadcrumbs={breadcrumbLinks}/>
        } else {
            return <LoadingView></LoadingView>
        }
    }
}