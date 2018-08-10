import React from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import { App, Box, Article, Split, Button } from 'grommet'
import MenuIcon from 'grommet/components/icons/base/Menu'
import { Dashboard, StudentList, ScheduleList, Schedule } from './'
import { Nav } from '../components'

class Layout extends React.PureComponent {
  state = {
    navActive: true
  }
  handleNav = () => {
    this.setState({ navActive: !this.state.navActive })
  }
  render() {
    const { navActive } = this.state
    const priority = navActive ? 'left' : 'right'
    let nav
    let openNav
    if (navActive) {
      nav = <Nav handleClose={this.handleNav} location={this.props.location} />
    } else {
      openNav = (
        <Button icon={<MenuIcon />} onClick={this.handleNav} margin="medium" />
      )
    }
    return (
      <App centered={false}>
        <Split priority={priority} flex="right">
          {nav}
          <Box pad="medium">
            <Article>
              {openNav}
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
    )
  }
}

export default withRouter(Layout)
