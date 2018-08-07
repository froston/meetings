import React from 'react';
import { Link } from 'react-router-dom';
import { Sidebar, Header, Title, Box, Menu } from 'grommet';

class Nav extends React.PureComponent {
  isActive = link => {
    const { location } = this.props
    if (location && location.pathname) {
      return location.pathname === link ? "active" : null
    }
  }
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
            <Link to="/" className={this.isActive('/')}>Dashboard</Link>
            <Link to="/students" className={this.isActive('/students')}>Students</Link>
            <Link to="/schedules" className={this.isActive('/schedules')}>Schedules</Link>
          </Menu>
        </Box>
      </Sidebar>
    );
  }
}

export default Nav;
