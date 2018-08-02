import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import App from 'grommet/components/App';
import Box from 'grommet/components/Box';
import Article from 'grommet/components/Article';
import Split from 'grommet/components/Split';
import { Dashboard, Students, Schedules } from './';
import { Nav } from '../components';

class Layout extends React.Component {
  isActive = link => {
    const { location } = this.props
    if (location && location.pathname) {
      return location.pathname === link ? "active" : null
    }
  }
  render() {
    return (
      <App centered={false}>
        <Split priority="left" flex="right">
          <Box colorIndex='neutral-1'>
            <Nav isActive={this.isActive} />
          </Box>
          <Box pad="medium">
            <Article>
              <Switch>
                <Route exact path="/" component={Dashboard} />
                <Route exact path="/students" component={Students} />
                <Route exact path="/schedules" component={Schedules} />
              </Switch>
            </Article>
          </Box>
        </Split>
      </App>
    );
  }
}

export default withRouter(Layout);
