import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import Menu from 'grommet/components/Menu';

class Nav extends React.Component {
  render() {
    return (
      <Sidebar>
        <Header size="large" justify="between" pad={{ horizontal: 'medium' }}>
          <Title a11yTitle="Close Menu">
            <span>Meetings</span>
          </Title>
        </Header>
        <Box flex='grow' justify='start'>
          <Menu fill={true} primary={true} size="large">
            <Link to="/" className={this.props.isActive('/')}>Dashboard</Link>
            <Link to="/students" className={this.props.isActive('/students')}>Students</Link>
            <Link to="/schedules" className={this.props.isActive('/schedules')}>Schedules</Link>
          </Menu>
        </Box>
      </Sidebar>
    );
  }
}

export default Nav;
