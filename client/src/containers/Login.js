import React from 'react'
import { withRouter, Redirect } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { Split, Article, Section, Footer, Sidebar, Button, Box, Heading } from 'grommet'
import Spinning from 'grommet/components/icons/Spinning'

import { withAuth } from '../utils'

class Login extends React.PureComponent {
  state = {
    loading: false,
    loginError: null,
  }

  componentDidMount() {
    const { state } = this.props.location
    if (state && state.message) {
      this.setState({ loginError: state.message })
    }
  }

  handleLogin = () => {
    this.setState({ loading: true })
    this.props.auth.signIn()
  }

  render() {
    const { t, auth } = this.props
    const { loading, loginError } = this.state
    if (auth.isSignedIn) {
      return <Redirect to="/" />
    }
    return (
      <Split flex="left" separator>
        <Article scrollStep controls>
          <Section full colorIndex="graph-1" pad="large" justify="center" align="center" />
        </Article>
        <Sidebar justify="between" align="center" pad="none" size="large">
          <Box />
          <Box margin="medium">
            <Heading>{t('title')}</Heading>
            <p>{t('welcome')}</p>
            {loginError && <p style={{ color: '#FF324D' }}>{loginError}</p>}
            <Button primary label="Login" onClick={!loading ? this.handleLogin : null} />
          </Box>
          <Footer direction="row" size="small" pad={{ horizontal: 'medium', vertical: 'small', between: 'small' }}>
            <span className="secondary">&copy; 2018 Pavel Müller</span>
          </Footer>
        </Sidebar>
      </Split>
    )
  }
}

export default withRouter(withTranslation('login')(withAuth(Login)))
