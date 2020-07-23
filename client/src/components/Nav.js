import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { translate } from 'react-i18next'
import { Sidebar, Header, Title, Box, Menu, Button, Footer } from 'grommet'
import { CloseIcon, LogoutIcon } from 'grommet/components/icons/base'
import { LangMenu } from './'

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
  render() {
    const { t, i18n } = this.props
    return (
      <Sidebar colorIndex="neutral-1">
        <Header size="large" justify="between" pad={{ horizontal: 'medium' }}>
          <Title a11yTitle="Close Menu" onClick={this.props.handleClose}>
            <span>{t('title')}</span>
          </Title>
          <Button icon={<CloseIcon />} onClick={this.props.handleClose} a11yTitle={t('closeMenu')} plain />
        </Header>
        <Box flex="grow" justify="start">
          <Menu fill primary>
            <Link to="/" className={this.isActive('/')} onClick={this.handleClick}>
              {t('dashboard')}
            </Link>
            <Link to="/students" className={this.isActive('students')} onClick={this.handleClick}>
              {t('students')}
            </Link>
            <Link to="/schedules" className={this.isActive('schedules')} onClick={this.handleClick}>
              {t('schedules')}
            </Link>
            <Link to="/territories" className={this.isActive('territories')} onClick={this.handleClick}>
              {t('territories')}
            </Link>
          </Menu>
        </Box>
        <Footer style={{ padding: 15, marginTop: 40 }}>
          <Button title="Logout" icon={<LogoutIcon />} onClick={this.logout} a11yTitle="Logout" plain />
          <LangMenu lang={i18n.language} setLang={this.setLang} />
        </Footer>
      </Sidebar>
    )
  }
}

Nav.propTypes = {
  responsive: PropTypes.string,
  location: PropTypes.object,
  setLang: PropTypes.func,
  logout: PropTypes.func,
}

export default translate('nav')(Nav)
