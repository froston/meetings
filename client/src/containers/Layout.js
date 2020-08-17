import React from 'react'
import { Switch, Route, withRouter } from 'react-router-dom'
import moment from 'moment'
import { withTranslation } from 'react-i18next'
import { Box, Article, Split, Button } from 'grommet'
import { MenuIcon, CloseIcon } from 'grommet/components/icons/base'
import { ToastContainer } from 'react-toastify'
import { Dashboard, StudentList, ScheduleList, Schedule, TerritoryList, NumberList, Work, AuthRoute } from './'
import { Nav } from '../components'
import { api, withAuth } from '../utils'

class Layout extends React.PureComponent {
  state = {
    navActive: true,
    responsive: 'multiple',
    meta: {},
  }

  componentDidMount() {
    moment.locale(this.props.i18n.language)

    api.get(`/users/${this.props.auth.user.uid}`).then((user) => {
      this.setState({ meta: user.meta })
    })
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
    this.props.auth.logout().then(() => {
      this.props.history.push({
        pathname: '/',
        state: { message: 'Logout successfull' },
      })
    })
  }

  render() {
    const { navActive, responsive, meta } = this.state
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
          meta={meta}
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
              {meta && (
                <Switch>
                  <Route exact path="/" render={(props) => <Dashboard {...props} meta={meta} />} />
                  <AuthRoute exact path="/students" component={StudentList} meta={meta} access="lifeministry" />
                  <AuthRoute exact path="/schedules" component={ScheduleList} meta={meta} access="lifeministry" />
                  <AuthRoute exact path="/schedules/:id" component={Schedule} meta={meta} access="lifeministry" />
                  <AuthRoute exact path="/territories" component={TerritoryList} meta={meta} access="territories" />
                  <AuthRoute exact path="/numbers" component={NumberList} meta={meta} access="territories" />
                  <AuthRoute exact path="/work" component={Work} meta={meta} access="territories" />
                </Switch>
              )}
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

export default withRouter(withTranslation()(withAuth(Layout)))
