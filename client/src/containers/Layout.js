import React from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import moment from 'moment'
import { translate } from 'react-i18next'
import { Box, Article, Split, Button } from 'grommet'
import { MenuIcon, CloseIcon } from 'grommet/components/icons/base'
import { ToastContainer } from 'react-toastify'
import { Dashboard, StudentList, ScheduleList, Schedule, Territories } from './'
import { Nav } from '../components'

class Layout extends React.PureComponent {
  state = {
    navActive: true,
    responsive: 'multiple',
  }

  componentDidMount() {
    moment.locale(this.props.i18n.language)
  }

  handleNav = () => {
    this.setState({ navActive: !this.state.navActive })
  }

  handleResponsive = (responsive) => {
    this.setState({ responsive })
  }

  setLang = (lang) => {
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
                <Route exact path="/territories" component={Territories} />
              </Switch>
            </Article>
          </Box>
        </Split>
        <ToastContainer
          position="bottom-center"
          className="snackbar"
          toastClassName="snackbar-toast"
          bodyClassName="snackbar-body"
          hideProgressBar
          pauseOnVisibilityChange
          draggable
          pauseOnHover
          closeButton={<CloseIcon colorIndex="light-1" style={{ margin: 15 }} />}
        />
      </div>
    )
  }
}

export default withRouter(translate()(Layout))
