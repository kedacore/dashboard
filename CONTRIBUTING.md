# Contributing to the KEDA Dashboard
Before reading this guide, make sure you first review the dashboard's [OVERVIEW](https://github.com/t-shama/keda-dashboard/blob/master/OVERVIEW.md) to get a better understanding of how the code is organized. This guide also assumes that you have a basic understanding of React, Typescript, and Kubernetes.


## Creating a new page to the dashboard

To start building a new page for the dashboard, create a folder under `/client/src/components` with the name of your component. Create a `.tsx` file. Here is an example of how you could start building your new component:

```typescript
import React from 'react';
import { CssBaseline } from '@material-ui/core';
import SideBarNav from '../SideBarNav';
import LoadingView from '../LoadingView';

export default class ExampleComponent extends React.Component<ExampleComponentProps, ExampleComponentState> {
    constructor(props: ScaleControllerDashboardProps) {
        super(props);

        this.state = {
            isLoaded: false,
        };
    }
    
    componentDidMount() {
    }

    componentWillUnmount() {
    }

   getExampleComponentContent() {
        return (
            <div>
              {/* Build your component here */}
            </div>
        );
    }

    render() {
        if (this.state.isLoaded) {
            let breadcrumbLinks = [
                {text: 'Example Component', link: '/path-to-component'}
            ];

            return (
                <React.Fragment>
                   <CssBaseline /> 
                   <SideBarNav content={this.getExampleComponentContent()} breadcrumbs={breadcrumbLinks}></SideBarNav>
               </React.Fragment>
            );
        } else {
            return <LoadingView></LoadingView>
        }
    }
}

interface ExampleComponentProps {
}

interface ExampleComponentState {
  isLoaded: boolean;
}
```

After you have built out your basic component, go to `App.tsx`. Create a new route in the `render()` method with the desired path of your page in the `path` component. Import your new component to the file and also add the component to the Route's `component` props. This will create a link to your new page, so if you navigate to it then it should appear!


## Adding navigation to your page

### Sidebar

To add a link to a new page in the sidebar, go to `/client/src/components/SideBarNav.tsx`. In `getNavLinks()` in the `SideBarNav` class, create a new `NavigationLinkModel` object with the name of the page that will appear in the sidebar, and the desired path to the page. 

### Breadcrumbs

In the `render()` function of your component class, create a list of `NavigationLinks` and pass them in the `breadcrumbs` props of the `SideBarNav`. The breadcrumb links go from general to specific, meaning that the last item in the list should be the name of and link to the component, and everything prior to that should be more general pages. For example, the list

```typescript
let breadcrumbLinks = [
    {text: 'Category', link: '/some-category'},
    {text: 'Subcategory, link: '/some-category/subcategory'}
];
```
should look like `Category > Subcategory` on the app bar. 

## Building your component

Now that you have a basic component built out, you can start adding content to it. Because pages are component classes themselves and are where all data from API calls are usually loaded to, smaller components (such as panels) take in data as props and import it into the page's class. This is so that Panels are generally created with Papers, given padding with the `p` prop of `Box` components, and positioned with `Grid` components. Here is one example of a panel component:

```typescript
export default class ExamplePanel extends React.Component<{}, {}> {
    render() {
        return (
            <Paper>
                <Box p={4}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={12} lg={12}>
                            <Typography variant="h6">Name of Panel</Typography>
                        </Grid>
                    </Grid>
                    
                    {/* Add more content to your panel here */}
                    
                </Box>
            </Paper>
        );
    }
}
```


## Making API calls

As stated before, API calls are usually made in the page's component class. Specifically, the calls are made in `componentDidMount()` and saved in the classes's state. To make a new API call, add a get request in `apis.ts`. One example of a get request is shown below:

```typescript
    app.get('/api/some/path', async (req, res) => {
        const cluster = kc.getCurrentCluster();

        if (!cluster) {
            res.status(501).json({
                error: 'cluster not found'
            });
            return;
        }

        const opts: request.Options = {
            url: `${cluster.server}/apis/some/call/to/k8s`
        };
        
        kc.applyToRequest(opts);
        const jsonStr = await request.get(opts);
        res.setHeader('Content-Type', 'application/json');
        res.send(jsonStr);
    });
```

In the above example, `/api/some/path` is the proxy call you would make in `componentDidMount()`, while `${cluster.server}/apis/some/call/to/k8s` is the call to the Kubernetes API. Proxy calls *must* start with `/api/`. For more information about the Kubernetes API, check out this [link](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.15/) to learn more. 

When you make a proxy call, be sure to make `componentDidMount()` an asynchronous function and have a boolean variable in the component's state to keep track of whether or not all the API calls have been completed to render the entire page. This allows you to also determine whether or not you should return the `LoadingView`, or the actual contents of the page. An example of `componentDidMount()` with an API call that also sets the state is shown below (from `/client/src/components/ScaledObjectsDashboard/ScaledObjectsDashboard.tsx`).

```typescript
async componentDidMount() {
    await fetch('/api/scaledobjects')
      .then(res => res.json())
      .then(({ items }) => this.setState({ scaledObjects: items }));

    this.setState({ loaded:true });
}
```

