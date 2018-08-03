import React from 'react';
import { Link } from 'react-router-dom';
import { Sidebar, Header, Title, Box, Menu } from 'grommet';

class Nav extends React.PureComponent {
  render() {
    return (
      <Sidebar>
        <Header size="large" justify="between" pad={{ horizontal: 'medium' }}>
          <Title a11yTitle="Close Menu">
            <span>Meetings</span>
          </Title>
        </Header>
        <Box flex='grow' justify='start'>
          <Menu fill primary>
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
