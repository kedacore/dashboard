import { Express } from 'express';
import request from 'request-promise-native';
import * as k8s from '@kubernetes/client-node';
import { KubeConfig } from '@kubernetes/client-node';
import { json } from 'body-parser';


const kc = new k8s.KubeConfig()
kc.loadFromDefault();

export function setupApis(app: Express) {
    app.get('/api/scaledobjects', async (_, res) => {
        const cluster = kc.getCurrentCluster();
        if (!cluster) {
            res.status(501).json({
                error: 'cluster not found'
            });
            return;
        }
        const opts: request.Options = {
            url: `${cluster.server}/apis/keda.k8s.io/v1alpha1/scaledobjects`
        };
        kc.applyToRequest(opts);
        const jsonStr = await request.get(opts);
        res.setHeader('Content-Type', 'application/json');
        res.send(jsonStr);
    });

    app.get(`/api/namespace/:namespace/scaledobjects/:name`, async (req, res) => {
        let name = req.params.name;
        let namespace = req.params.namespace

        const cluster = kc.getCurrentCluster();
        if (!cluster) {
            res.status(501).json({
                error: 'cluster not found'
            });
            return;
        }
        const opts: request.Options = {
            url: `${cluster.server}/apis/keda.k8s.io/v1alpha1/namespaces/${namespace}/scaledobjects/${name}`
        };
        kc.applyToRequest(opts);
        const jsonStr = await request.get(opts);
        res.setHeader('Content-Type', 'application/json');
        res.send(jsonStr);
    });

    app.get('/api/hpa', async (_, res) => {
        const cluster = kc.getCurrentCluster();
        if (!cluster) {
            res.status(501).json({
                error: 'cluster not found'
            });
            return;
        }

        const opts: request.Options = {
            url: `${cluster.server}/apis/autoscaling/v1/horizontalpodautoscalers/`
        };
        kc.applyToRequest(opts);
        const jsonStr = await request.get(opts);
        res.setHeader('Content-Type', 'application/json');
        res.send(jsonStr);
    });

    app.get(`/api/namespace/:namespace/hpa/:name`, async (req, res) => {
        let namespace = req.params.namespace;
        let name = req.params.name;

        if (!namespace) {
            namespace = 'default';
        }

        const cluster = kc.getCurrentCluster();
        if (!cluster) {
            res.status(501).json({
                error: 'cluster not found'
            });
            return;
        }

        const opts: request.Options = {
            url: `${cluster.server}/apis/autoscaling/v1/namespaces/${namespace}/horizontalpodautoscalers/${name}`
        };
        kc.applyToRequest(opts);
        const jsonStr = await request.get(opts);

        res.setHeader('Content-Type', 'application/json');
        res.send(jsonStr);
    });

    app.get(`/api/namespace/:namespace/deployment/:name`, async (req, res) => {
        let namespace = req.params.namespace;
        let name = req.params.name;

        if (!namespace) {
            namespace = 'default';
        }

        const cluster = kc.getCurrentCluster();
        if (!cluster) {
            res.status(501).json({
                error: 'cluster not found'
            });
            return;
        }

        const opts: request.Options = {
            url: `${cluster.server}/apis/apps/v1/namespaces/${namespace}/deployments/${name}`
        };
        kc.applyToRequest(opts);
        const jsonStr = await request.get(opts);

        res.setHeader('Content-Type', 'application/json');
        res.send(jsonStr);
    });

    app.get(`/api/namespace/:namespace/pods/:name/logs`, async (req, res) => {
        let namespace = req.params.namespace;
        let name = req.params.name;

        if (!namespace) {
            namespace = 'default';
        }

        const cluster = kc.getCurrentCluster();
        if (!cluster) {
            res.status(501).json({
                error: 'cluster not found'
            });
            return;
        }

        const opts: request.Options = {
            url: `${cluster.server}/api/v1/namespaces/${namespace}/pods/${name}/log?tailLines=300`
        };
        kc.applyToRequest(opts);
        const jsonStr = await request.get(opts);

        res.setHeader('Content-Type', 'application/json');
        res.send(jsonStr);
    });
    

    app.get('/api/keda', async (req, res) => {
        const cluster = kc.getCurrentCluster();

        if (!cluster) {
            res.status(501).json({
                error: 'cluster not found'
            });
            return;
        }

        const opts: request.Options = {
            url: `${cluster.server}/apis/apps/v1/namespaces/keda/deployments/keda-operator`
        };
        kc.applyToRequest(opts);
        const jsonStr = await request.get(opts);
        res.setHeader('Content-Type', 'application/json');
        res.send(jsonStr);
    });

    app.get('/api/keda/pod', async (req, res) => {
        const cluster = kc.getCurrentCluster();

        if (!cluster) {
            res.status(501).json({
                error: 'cluster not found'
            });
            return;
        }

        const opts: request.Options = {
            url: `${cluster.server}/api/v1/namespaces/keda/pods?labelSelector=app%3Dkeda-operator`
        };
        kc.applyToRequest(opts);
        let pod = await request.get(opts);
        
        res.setHeader('Content-Type', 'application/json');
        res.send(pod);
    });

    app.get('/api/logs', async (req, res) => {
        const cluster = kc.getCurrentCluster();

        if (!cluster) {
            res.status(501).json({
                error: 'cluster not found'
            });
            return;
        }

        const opts: request.Options = {
            url: `${cluster.server}/api/v1/namespaces/keda/pods/keda-operator-75f55c75fd-wj547/log?tailLines=300`
        };
        kc.applyToRequest(opts);
        let logs = await request.get(opts);
        res.setHeader('Content-Type', 'text/plain');
        res.send(logs);
    });

    app.get('/api/logs/metrics', async (req, res) => {
        const cluster = kc.getCurrentCluster();

        if (!cluster) {
            res.status(501).json({
                error: 'cluster not found'
            });
            return;
        }

        const opts: request.Options = {
            url: `${cluster.server}/api/v1/namespaces/keda/pods/keda-operator-75f55c75fd-wj547/log?tailLines=300`
        };
        kc.applyToRequest(opts);
        const logs = await request.get(opts);
        res.setHeader('Content-Type', 'text/plain');

        let logsArray = logs.split("\n");
        let scaleDecisionLogs: string[] = [];
        let replicaMetricsRegex = new RegExp("Metric Type: Replica Count; .*");

        logsArray.forEach((element:string) => {
            if (replicaMetricsRegex.test(element)) {
                scaleDecisionLogs.push(element);
            }
        });

        res.send(scaleDecisionLogs.join("\n"));
    });

    app.get(`/api/namespace/:namespace/metrics/:metricsname`, async (req, res) => {
        let namespace = req.params.namespace;
        let metricsname = req.params.metricsname;

        const cluster = kc.getCurrentCluster();

        if (!cluster) {
            res.status(501).json({
                error: 'cluster not found'
            });
            return;
        }

        const opts: request.Options = {
            url: `${cluster.server}/apis/external.metrics.k8s.io/v1beta1/namespaces/${namespace}/${metricsname}`
        };
        kc.applyToRequest(opts);
        const metrics = await request.get(opts);
        res.setHeader('Content-Type', 'application/json');

        res.send(metrics);
    });
}