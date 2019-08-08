# dashboard
Dashboard to use to view details of your keda deployment

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

Click [here](https://github.com/t-shama/keda-dashboard/blob/master/OVERVIEW.md) for an overview of the KEDA codebase.

## Contributing

Click [here](https://github.com/t-shama/keda-dashboard/blob/master/CONTRIBUTING.md) to learn how to contribute to the KEDA dashboard.
