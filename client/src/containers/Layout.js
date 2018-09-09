import React from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import moment from 'moment'
import { translate } from 'react-i18next'
import { Box, Article, Split, Button } from 'grommet'
import { MenuIcon } from 'grommet/components/icons/base'
import { ToastContainer } from 'react-toastify'
import { Dashboard, StudentList, ScheduleList, Schedule } from './'
import { Nav } from '../components'

class Layout extends React.PureComponent {
  state = {
    navActive: true,
    responsive: 'multiple'
  }

  componentDidMount() {
    moment.locale(this.props.i18n.language)
  }

  handleNav = () => {
    this.setState({ navActive: !this.state.navActive })
  }

  handleResponsive = responsive => {
    this.setState({ responsive })
  }

  setLang = lang => {
    moment.locale(lang)
    this.props.i18n.changeLanguage(lang)
  }

  logout = () => {
    localStorage.removeItem('auth')
    this.props.history.push('/login')
  }

  render() {
    const { navActive, responsive } = this.state
    const priority = navActive ? 'left' : 'right'
    let nav
    let openNav
    if (navActive) {
      nav = (
        <Nav
          setLang={this.setLang}
          handleClose={this.handleNav}
          logout={this.logout}
          location={this.props.location}
          responsive={responsive}
        />
      )
    } else {
      openNav = <Button icon={<MenuIcon />} onClick={this.handleNav} margin="medium" />
    }
    return (
      <div>
        <Split flex="right" priority={priority} onResponsive={this.handleResponsive}>
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
        <ToastContainer position="top-center" hideProgressBar pauseOnVisibilityChange draggable pauseOnHover />
      </div>
    )
  }
}

export default withRouter(translate()(Layout))
