import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Sidebar, Header, Title, Box, Menu, Button } from 'grommet'
import CloseIcon from 'grommet/components/icons/base/Close'

class Nav extends React.PureComponent {
  isActive = link => {
    const { location } = this.props
    if (location && location.pathname) {
      return location.pathname === link ? 'active' : null
    }
  }
  handleClick = () => {
    if (this.props.responsive === 'single') {
      this.props.handleClose()
    }
  }
  render() {
    return (
      <Sidebar colorIndex="neutral-1">
        <Header size="large" justify="between" pad={{ horizontal: 'medium' }}>
          <Title a11yTitle="Close Menu" onClick={this.props.handleClose}>
            <span>Meetings</span>
          </Title>
          <Button
            icon={<CloseIcon />}
            onClick={this.props.handleClose}
            a11yTitle="Close Menu"
            plain
          />
        </Header>
        <Box flex="grow" justify="start">
          <Menu fill primary>
            <Link to="/" className={this.isActive('/')} onClick={this.handleClick}>
              Dashboard
            </Link>
            <Link to="/students" className={this.isActive('/students')} onClick={this.handleClick}>
              Students
            </Link>
            <Link
              to="/schedules"
              className={this.isActive('/schedules')}
              onClick={this.handleClick}
            >
              Schedules
            </Link>
          </Menu>
        </Box>
      </Sidebar>
    )
  }
}

Nav.propTypes = {
  location: PropTypes.object
}

export default Nav
