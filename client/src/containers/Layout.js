import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { App, Box, Article, Split } from 'grommet'
import { Dashboard, StudentList, ScheduleList, Schedule } from './';
import { Nav } from '../components';

class Layout extends React.PureComponent {
  render() {
    return (
      <App centered={false}>
        <Split priority="left" flex="right">
          <Box colorIndex='neutral-1'>
            <Nav location={this.props.location} />
          </Box>
          <Box pad="medium">
            <Article>
              <Switch>
                <Route exact path="/" component={Dashboard} />
                <Route exact path="/students" component={StudentList} />
                <Route exact path="/schedules" component={ScheduleList} />
                <Route exact path="/schedules/:id" component={Schedule} />
              </Switch>
            </Article>
          </Box>
        </Split>
      </App>
    );
  }
}

export default withRouter(Layout);
