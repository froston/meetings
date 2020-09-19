import React from 'react'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { Sidebar, Header, Title, Box, Menu, Button, Footer, Image } from 'grommet'
import { CloseIcon, LogoutIcon, SettingsOptionIcon } from 'grommet/components/icons/base'
import { LangMenu } from './'
import { withAuth, functions } from '../utils'

class Nav extends React.PureComponent {
  getParentUrl = (path) => path.split('/')[1] || '/' // the menu key is always parent url

  isActive = (link) => {
    const { location } = this.props
    if (location && location.pathname) {
      const path = this.getParentUrl(location.pathname)
      return path === link ? 'active' : null
    }
  }
  handleClick = () => {
    if (this.props.responsive === 'single') {
      this.props.handleClose()
    }
  }
  setLang = (lang) => {
    this.props.setLang(lang)
  }
  logout = () => {
    this.props.logout()
  }
  goToSettings = () => {
    this.props.history.push('/settings')
  }
  render() {
    const { t, i18n, auth, meta } = this.props
    const isWorking = this.isActive('work') || this.isActive('worked')
    return (
      <Sidebar colorIndex="neutral-1">
        <Header size="large" justify="between" pad={{ horizontal: 'medium' }}>
          <Title a11yTitle="Close Menu" onClick={this.props.handleClose}>
            <span>{t('title')}</span>
          </Title>
          <Button icon={<CloseIcon />} onClick={this.props.handleClose} a11yTitle={t('closeMenu')} plain />
        </Header>
        <Box flex="grow" justify="start">
          {meta && (
            <Menu fill primary>
              <Link to="/" className={this.isActive('/')} onClick={this.handleClick}>
                {t('dashboard')}
              </Link>
              {functions.hasAccess(meta, 'lifeministry') && (
                <>
                  <Link to="/students" className={this.isActive('students')} onClick={this.handleClick}>
                    {t('students')}
                  </Link>
                  <Link to="/schedules" className={this.isActive('schedules')} onClick={this.handleClick}>
                    {t('schedules')}
                  </Link>
                </>
              )}
              {(functions.hasAccess(meta, 'territories') || (isWorking && functions.hasAccess(meta, 'work'))) && (
                <Link
                  to="/territories"
                  className={this.isActive('territories') || isWorking}
                  onClick={this.handleClick}
                >
                  {t('territories')}
                </Link>
              )}
              {functions.hasAccess(meta, 'numbers') && (
                <Link to="/numbers" className={this.isActive('numbers')} onClick={this.handleClick}>
                  {t('numbers')}
                </Link>
              )}
              {functions.hasAccess(meta, 'admin') && (
                <Link to="/users" className={this.isActive('users')} onClick={this.handleClick}>
                  {t('users')}
                </Link>
              )}
            </Menu>
          )}
        </Box>
        <Footer style={{ padding: 15, marginTop: 40 }}>
          <Box margin="small">
            <Image
              style={{ width: '40px', borderRadius: 20 }}
              src={auth.user.photoURL}
              size="small"
              title={auth.user.displayName}
            />
          </Box>
          <Button title="Logout" icon={<LogoutIcon />} onClick={this.logout} a11yTitle="Logout" plain />
          <LangMenu lang={i18n.language} setLang={this.setLang} />
          <Button
            title="Settings"
            icon={<SettingsOptionIcon />}
            onClick={this.goToSettings}
            a11yTitle="Settings"
            plain
          />
        </Footer>
      </Sidebar>
    )
  }
}

Nav.propTypes = {
  auth: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  responsive: PropTypes.string,
  setLang: PropTypes.func,
  logout: PropTypes.func,
}

export default withTranslation('nav')(withRouter(withAuth(Nav)))
