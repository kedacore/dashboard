import React from 'react';
import clsx from 'clsx';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Container, Drawer, CssBaseline, AppBar, Toolbar, List, Typography, ListItem, ListItemText, Breadcrumbs } from '@material-ui/core';
import { NavigationLinkModel } from '../models/NavigationLinks';
import {  Link } from 'react-router-dom'
import { ScaledObjectModel } from '../models/ScaledObjectModel';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';



const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    breadCrumbAppBar: {
      zIndex: theme.zIndex.drawer + 1,
      background: '#2b78e4',
      paddingLeft: theme.spacing(0.5),
      paddingTop: theme.spacing(1)
    },
    logoAppBar: {
      color: '#2b78e4',
      background: 'white',
      zIndex: theme.zIndex.drawer + 2,
      zDepthShadows: 'none',
      padding: theme.spacing(2),
      paddingLeft: theme.spacing(2)
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
      paddingTop: theme.spacing(9),
      paddingLeft: theme.spacing(1.5),
      border: '0px',
      background: '#fafafa'
    },
    drawerText: {
      fontWeight: 'bold'
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '16px',
      paddingTop: '30px',
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(2),
      marginLeft: drawerWidth,
      marginTop: '68px'
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    noLinkStyle: {
      textDecoration: 'none',
      color: 'white',
    },
    toolbar: theme.mixins.toolbar
  }),
);


const DrawerListItem: React.FunctionComponent<{navLink: NavigationLinkModel, id: number}> = (props) => {
  const classes = useStyles();

  if (props.navLink.sublinks) {
    return (
      <div>
        <ListItem button component={Link} to={props.navLink.link} key={props.id}> 
          <ListItemText disableTypography primary={props.navLink.text} className={classes.drawerText}/>
        </ListItem>
        { props.navLink.sublinks.map( 
          (link: NavigationLinkModel, index:number) =>
          <ListItem button component={Link} to={link.link} className={classes.nested} key={`${props.id}${index}`}> 
            <ListItemText disableTypography primary={link.text} />
          </ListItem>
        )}
      </div>
  );}

  return (
    <ListItem button component={Link} to={props.navLink.link} key={props.id}> 
      <ListItemText disableTypography primary={props.navLink.text} className={classes.drawerText}/>
    </ListItem>
  );
};

const SideNav: React.FunctionComponent<{ content: any, navLinks: NavigationLinkModel[], breadcrumbs:NavigationLinkModel[]}> = (props) => {
    const classes = useStyles();
    const logo = require('../imgs/keda-logo-transparent.png');

    function getBreadCrumbs() {
      let breadcrumbLinks = [];

      // Create links for each breadcrumb
      for (let i = 0; i < props.breadcrumbs.length; i++) {
        breadcrumbLinks.push(
          <Link
            key={i}
            color="white"
            to={props.breadcrumbs[i].link} 
            aria-current="page"
            className={classes.noLinkStyle}
          >
            <Typography>{ props.breadcrumbs[i].text }</Typography>
          </Link>);
      }

      return (
        <Breadcrumbs aria-label="Breadcrumb" separator={<NavigateNextIcon fontSize="small" />}>
         { breadcrumbLinks }
        </Breadcrumbs>
      )

    }

    return (
        <div className={classes.root}>
          <CssBaseline />
          <div style={{flexGrow: 1}}>
              {/* Breadcrumbs App bar (mainly navigation)  */}
            <AppBar
                position="fixed"
                className={clsx(classes.logoAppBar)}
            >
              <img alt='logo' style={{ width: 100 }} src={String(logo)} />
            </AppBar>

            <AppBar
                position="fixed"
                className={clsx(classes.breadCrumbAppBar)}
                
            >
              <div className={classes.toolbar}/>
              <Toolbar> { getBreadCrumbs() } </Toolbar>
            </AppBar>

            <Drawer
                className={classes.drawer}
                variant="permanent"
                anchor="left"
                classes={{
                  paper: classes.drawerPaper,
                }}
            >
              <div className={classes.toolbar}/>
              <List>
                { props.navLinks.map((link: NavigationLinkModel, index:number) => <DrawerListItem key={index} id={index} navLink={link}></DrawerListItem>) }
              </List>
            </Drawer>

            <main
                className={clsx(classes.content)}
            >
                <div className={classes.drawerHeader} />
                <Container maxWidth="lg">
                    { props.content }
                </Container>
            </main>
          </div>
        </div>

    );
};

export default class SideBarNav extends React.Component<{content: any, breadcrumbs:NavigationLinkModel[]}, {scaledObjects: ScaledObjectModel[]}> {
  constructor(props: {content: any, breadcrumbs:NavigationLinkModel[]}) {
    super(props);

    this.state = {
      scaledObjects: []
    }
  }

  componentDidMount() {
    fetch('/api/scaledobjects')
        .then(res => res.json())
        .then(({ items }) => this.setState({ scaledObjects: items }));
  }

  getScaledObjectSublinks() {
    let sublinks: NavigationLinkModel[] = [];

    for (let i = 0; i < this.state.scaledObjects.length; i++) {
      if (this.state.scaledObjects[i].metadata) {
        let sublink = '/scaled-objects/namespace/' + this.state.scaledObjects[i].metadata.namespace + '/scaled-object/' + this.state.scaledObjects[i].metadata.name;
        sublinks.push(new NavigationLinkModel(this.state.scaledObjects[i].metadata.namespace + '/' + this.state.scaledObjects[i].metadata.name, sublink));
      }
    }

    return sublinks;
  }

  getNavLinks() {
    return [
      new NavigationLinkModel("Overview", "/"), 
      new NavigationLinkModel("Scaled Objects", "/scaled-objects", this.getScaledObjectSublinks())
    ];
  }

  render() {
    return (
      <div>
        <SideNav content={this.props.content} navLinks={this.getNavLinks()} breadcrumbs={this.props.breadcrumbs}></SideNav>
      </div>
    );
  }
}
