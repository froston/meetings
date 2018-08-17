import React from 'react'
import { withRouter } from 'react-router-dom'
import { App, Split, Article, Section, Footer, Sidebar, LoginForm } from 'grommet'
import { api } from '../utils'
class Login extends React.PureComponent {
  state = {
    loginError: null
  }
  handleSubmit = ({ username, password }) => {
    api.authenticate(username, password, (err, auth) => {
      if (err) {
        this.setState({ loginError: err })
        throw err
      }
      localStorage.setItem('auth', auth)
      this.props.history.push('/')
    })
  }
  render() {
    return (
      <Split flex="left" separator>
        <Article scrollStep controls>
          <Section full colorIndex="graph-1" pad="large" justify="center" align="center" />
        </Article>
        <Sidebar justify="between" align="center" pad="none" size="large">
          <span />
          <LoginForm
            align="start"
            onSubmit={this.handleSubmit}
            errors={[this.state.loginError]}
            title="Meetings"
            secondaryText="Welcome to ministry meetings app"
          />
          <Footer direction="row" size="small" pad={{ horizontal: 'medium', vertical: 'small', between: 'small' }}>
            <span className="secondary">&copy; 2018 Pavel Muller</span>
          </Footer>
        </Sidebar>
      </Split>
    )
  }
}

export default withRouter(Login)
