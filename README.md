<p align="center"><img src="https://github.com/kedacore/keda/blob/master/images/keda-logo-transparent.png" width="300"/></p>
<p style="font-size: 25px" align="center"><b>Kubernetes-based Event Driven Autoscaling Dashboard</b></p>

Dashboard to use to view details of your [KEDA](https://github.com/kedacore/keda) deployment.

## Prerequisites

- [node 10.x](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/en/docs/install)

## Running:

```bash
yarn install
yarn watch
```

then go to `http://localhost:3000` in the browser. `watch` will auto build any changes to client or server code.

## Deploy to a cluster:

```bash
# build docker image
docker build -t {dockerhubAlias}/keda-dashboard .

# update user in the template below and then run apply
kubectl apply -f deploy/keda-dashboard.yaml
```

## Access service in cluster

```bash
kubectl port-forward {pod-name} 8080:8080 --namespace keda
```

then go to `http://localhost:8080` in the browser.

## Overview

Click [here](OVERVIEW.md) for an overview of the KEDA codebase.

## Contributing

Click [here](CONTRIBUTING.md) to learn how to contribute to the KEDA dashboard.
