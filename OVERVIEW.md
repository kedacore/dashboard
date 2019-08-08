# Overview

The KEDA Dashboard is divided into folders for each page in the site. For now, this consists of the scale controller dashboard, the scaled objects dashboard, and the scaled object dashboard. There is one component for each view, and each view consists of other components that are each of the panels on the web page. Each page has a method that returns its page components, and this method is then loaded in the content props for the sidebar nav. 

## General Dashboard Components

### AppBar and SideBarNav

`SideBarNav`: The sidebar navigation links to the scale controller dashboard ("Overview"), the scaled objects dashboard ("Scaled Objects"), and all currently deployed scaled objects. The sidebar navigation gets a list of all scaled objects by making an API call for the scaled object's namespace and name, and then constructing the link for that scaled object with this information. The SideBarNav class is a wrapper class for the SideNav component and is where API calls are made to get the current scaled objects and pass them in the props of the SideNav components. The primary reason why there is both a SideNav and a SideBarNav is because I needed `useStyles` to create CSS changes in a lot of my React components, but couldn't find a way to use `useStyles` in a component class.
	
`AppBar`: The app bar is included in the SideNav component. There are two app bar components that are being used--one that is meant only for the KEDA logo, and one that displays the breadcrumbs of the page you're currently on. The SideNav is also where it takes the list of breadcrumbs, formats them into React components. 
	
Any changes to be made to either the app bar or the side bar should therefore be made in the SideNav component, and any data that should be retrieved through API calls should be made in SideBarNav (apologies for the name confusion!).

### LoadingView

`LoadingView` is a simple component; the most important thing to note about it is that it is used in every page that makes asynchronous API calls (`ScaleControllerDashboard`, `ScaledObjectDetailsDashboard`, and `ScaledObjectsDashboard`) so that it does not render the page until everything has been loaded. This is necessary so that the page doesn't look empty by rendering its components without the data in it.


## Scale Controller Dashboard components

### ScaleControllerDashboard 

`ScaleControllerDashboard` is the class that renders two main pieces of information: logs about your KEDA deployment and its scaling decisions, and details about your KEDA deployment. All API calls are made in `componentDidMount`, and calls are made to get logs every 5 seconds and update the log panel. Since this is where your KEDA deployment's logs are fetched, log parsing also occurs in this class. 

`formatLogs` parses through every line in the log and displays all except those emitting logs for historical data about a scaled object's replica count or metrics. An important thing to note that if you choose to change the way the Scaled Object's replica count and metrics are emitted in the longs, the regexes **must** be changed here too.

`getLogs` is a method I didn't quite yet get to finish. The API call I currently use to get the scale controller's logs requires me to know the name of the pod running KEDA. I created an API request that can find this pod using its label (can be found in `apis.ts`) but this restructuring meant I have to make two API calls for logs instead of one (one to find the pod, and another to get the logs from the pod). There is another version of this for the `ScaledObjectDetailsDashboard`. 

### ScaleControllerDetailPanel 

`ScaleControllerDetailPanel` primarily displays your KEDA deployment's information in a panel. The most notable thing to note about the panel is the `listChips` method, which formats a list into `Chip` components. I created a constant component called `ScaleControllerDetail` which took in a detailName and detailValue, but it became difficult to determine whether or not `detailValue` was a list or just one value, so I ended up creating another prop called `detailValueList` to only take list items in so that `ScaleControllerDetail` knew whether or not to display `Chips` or just a `Typography` element based on which prop was given. I did not do anything to validate this (between `detailValue` and `detailValueList`) so this might cause some bugs or issues.

### ScaleControllerLogPanel

`ScaleControllerLogPanel` displays all given KEDA logs. It is mostly just React elements, so any changes here would be for UI changes to the panel.

## Scaled Objects Dashboard components

`ScaledObjectsDashboard` is a relatively simple page, as it tries to find general information about all scaled objects and their associated deployments and HPAs. Not all API calls are made only in the dashboard component - they are also made in the `ScaledObjectsTable` component (primarily because we only get the name and namespace of the scaled object in the first API call made by 
`ScaledObjectsDashboard`.


## Scaled Objects Detail Dashboard components

### ScaledObjectsDetailDashboard

The `ScaledObjectsDetailDashboard` currently has 5 panels: the `ScaledObjectDetailPanel`, `ReplicaDisplay`, `ScaleTargetPanel`, `TriggerTable`, and `ScaledObjectLogPanel`. Because this dashboard also displays logs and uses logs to create a graph, it too parses and formats logs in its class.

The `formatLogs` method works the same as the `ScaleControllerDashboard`'s method except that it does one additional check--it finds logs that emit external metrics and finds the metrics associated with a scale decision. The KEDA scale controller seems to emit scale decision/activation logs before logs with external metrics. To solve this issue, all scale decision logs were additionally saved in a dictionary so that when an external metric was found, it could be added to a log with the same timestamp. One problem with this was that sometimes there are multiple metrics with the same timestamp, or a metric would be emitted in a slightly different timestamp. The solution I took was to not consider the milliseconds in the timestamp and round the timestamp's seconds up. However, sometimes metrics still do not match up with the correct logs, so more improvements need to be made here.

`getLogs` is almost exactly the same as `getLogs` in `ScaleControllerLogPanel`.

### ScaleObjectDetailPanel, ScaleTargetPanel, and ScaledObjectLogPanel

Both the `ScaleObjectDetailPanel` and `ScaledObjectLogPanel` are similar to the `ScaleControllerDashboard`'s counterparts with a few additional React components. The `ScaleTargetPanel` is also similar to the detail panels.

An issue in the `ScaledObjectLogPanel` is that sometimes it does not pick up the input metrics correctly. This is primarily because metrics are not emitted in logs until after a scaled object is activated (and thus after the log showing that a scaled object activated is already displayed in the log table). 

### TriggerTable

The `TriggerTable` lists all the triggers of a Scaled Object. Although getting most of the data was not necessarily difficult, it seems that the trigger name is always empty (which may be because the KEDA scale controller is not setting everything in the scaled object?). To replace this I instead got the eventHubName/queueName/etc. from the metadata, but this doesn't seem correct because a developer could delete this metadata and still have their Azure Functions work. Another issue is that Functions-specific metadata appears (like direction or cardinality). 

### ReplicaDisplay

The `ReplicaDisplay` is essentially a bar graph created with the [nivo](https://github.com/plouc/nivo) library. I chose it because it was open-source and because it had extensive documentation that was easy to follow. Documentation on the nivo bar graph can be found [here](https://nivo.rocks/bar/). 

The `ReplicaDisplay` has to make its own API call to get logs and parse through them for logs emitting metrics about the replica count. For now it displays the replica count of the last 50 minutes. One issue I had was determining what was the best way to represent the replica count would be. Although I for now pull directly from the replica count at each timestamp, if you wanted to capture the number of logs every past 5 minutes, `getMetricsFromLogs` might have to be changed to either get a log emitted after every 5 minutes, or get all the logs in a 5 minute timespan and calculate the average.

Another issue with the replica display is that because there are so many timestamps, the labels end up crowding the x-axis. While it's possible to space out ticks on the y-axis, nivo does not seem to have the same configurable property for the x-axis.
