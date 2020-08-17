import React from 'react'
import { withRouter, Redirect } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { Split, Article, Section, Footer, Sidebar, Button, Box, Heading } from 'grommet'

import { withAuth } from '../utils'

class Login extends React.PureComponent {
  state = {
    loading: true,
    loginError: null,
  }

  componentDidMount() {
    const { state } = this.props.location
    if (state && state.message) {
      this.setState({
        loginError: state.message,
        loading: false,
      })
    }
    this.props.auth.firebaseAuth.onAuthStateChanged((user) => {
      if (!user) {
        this.setState({ loading: false })
      }
    })
  }

  handleLogin = () => {
    this.setState({ loading: true })
    this.props.auth.signIn()
  }

  render() {
    const { t, auth, location } = this.props
    const { loading, loginError } = this.state
    if (auth.isSignedIn) {
      const { state } = location
      const redirect = state && state.from ? state.from : '/'
      return <Redirect to={redirect} />
    }
    return (
      <Split flex="left" separator>
        <Article scrollStep controls>
          <Section full colorIndex="graph-1" pad="large" justify="center" align="center" />
        </Article>
        <Sidebar justify="between" align="center" pad="none" size="large">
          <Box />
          <Box margin="medium" className="login-form">
            <Heading>{t('title')}</Heading>
            <p>{t('welcome')}</p>
            {loginError && <p style={{ color: '#FF324D' }}>{loginError}</p>}
            <Button primary label={loading ? t('logging') : t('login')} onClick={!loading ? this.handleLogin : null} />
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
