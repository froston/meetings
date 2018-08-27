import React from 'react'
import PropTypes from 'prop-types'
import { Anchor, Menu } from 'grommet'
import { LocationIcon } from 'grommet/components/icons/base'

class LangMenu extends React.PureComponent {
  handleClick = lang => {
    this.props.setLang(lang)
  }
  render() {
    const { lang } = this.props
    return (
      <Menu responsive icon={<LocationIcon />} size="small">
        <Anchor href="#" onClick={() => this.handleClick('en')} className={lang === 'en' ? 'active' : ''}>
          English
        </Anchor>
        <Anchor href="#" onClick={() => this.handleClick('es')} className={lang === 'es' ? 'active' : ''}>
          Espanol
        </Anchor>
        <Anchor href="#" onClick={() => this.handleClick('cs')} className={lang === 'cs' ? 'active' : ''}>
          Cestina
        </Anchor>
      </Menu>
    )
  }
}

LangMenu.propTypes = {
  active: PropTypes.string,
  changeLang: PropTypes.object
}

export default LangMenu
