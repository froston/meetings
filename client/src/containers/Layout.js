import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import App from 'grommet/components/App';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import Article from 'grommet/components/Article';
import Split from 'grommet/components/Split';
import { Dashboard, Students } from './';

class Layout extends Component {
  render() {
    return (
      <App centered={false}>
        <Split flex="right">
          <Box colorIndex='neutral-1'>
            <Sidebar>
              <Header size="large" justify="between" pad={{ horizontal: 'medium' }}>
                <Title onClick={this._onClose} a11yTitle="Close Menu">
                  <span>Meetings</span>
                </Title>
              </Header>
              <Box flex='grow' justify='start'>
                <Menu primary={true}>
                  <Anchor href='#' className='active'>First</Anchor>
                </Menu>
              </Box>
            </Sidebar>
          </Box>
          <Box colorIndex='light-2' flex='grow'>
            <Article>
              <Switch>
                <Route exact path="/" component={Dashboard} />
                <Route exact path="/students" component={Students} />
              </Switch>
            </Article>
          </Box>
        </Split>
      </App>
    );
  }
}

export default Layout;
