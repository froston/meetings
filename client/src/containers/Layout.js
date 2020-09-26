import React from 'react'
import { Switch, Route, withRouter, Redirect } from 'react-router-dom'
import moment from 'moment'
import { withTranslation } from 'react-i18next'
import { Box, Article, Split, Button } from 'grommet'
import { MenuIcon, CloseIcon } from 'grommet/components/icons/base'
import { ToastContainer } from 'react-toastify'
import Cookies from 'js-cookie'
import {
  Dashboard,
  StudentList,
  ScheduleList,
  Schedule,
  TerritoryList,
  NumberList,
  Work,
  AuthRoute,
  UsersList,
  Settings,
} from './'
import { Nav, Worked } from '../components'
import { api, withAuth } from '../utils'
import { AppContext } from '../utils/context'

class Layout extends React.PureComponent {
  state = {
    navActive: true,
    responsive: 'multiple',
    meta: null,
    settings: {},
    suggestions: [],
  }

  componentDidMount() {
    const lang = this.props.i18n.language
    moment.locale(lang)
    Cookies.set('languages', [lang])

    api.get(`/users/${this.props.auth.user.uid}`).then((user) => {
      this.setState({ meta: user.meta })
    })
    api.get(`/settings`).then((settings) => {
      this.setState({ settings })
    })
    api.get(`/territories/suggestions`).then((suggestions) => {
      this.setState({ suggestions })
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
    Cookies.set('languages', [lang])
    this.props.i18n.changeLanguage(lang)
  }

  changeSetting = (name, value) => {
    const settings = {
      ...this.state.settings,
      [name]: value,
    }
    this.setState({ settings })
  }

  logout = () => {
    this.props.auth.logout().then(() => {
      this.props.history.push({
        pathname: '/',
        state: { message: this.props.t('logoutSuccessfull') },
      })
    })
  }

  render() {
    const { navActive, responsive, meta, settings, suggestions } = this.state
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
        <AppContext.Provider value={{ settings, changeSetting: this.changeSetting, suggestions }}>
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
                    <AuthRoute exact path="/numbers" component={NumberList} meta={meta} access="numbers" />
                    <AuthRoute exact path="/work/:id" component={Work} meta={meta} access="work" />
                    <AuthRoute exact path="/worked" component={Worked} meta={meta} access="work" />
                    <AuthRoute exact path="/settings" component={Settings} meta={meta} access="admin" />
                    <AuthRoute exact path="/users" component={UsersList} meta={meta} access="admin" />
                    <Redirect to="/" />
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
        </AppContext.Provider>
      </div>
    )
  }
}

export default withRouter(withTranslation()(withAuth(Layout)))
