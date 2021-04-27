import React from 'react'
import { toast } from 'react-toastify'

const withConnection = (WrappedComponent) => {
  return class extends React.Component {
    state = {
      online: navigator.onLine,
    }
    componentDidMount() {
      window.addEventListener('online', this.handleConnection)
      window.addEventListener('offline', this.handleConnection)
    }

    componentWillUnmount() {
      window.removeEventListener('online', this.handleConnection)
      window.removeEventListener('offline', this.handleConnection)
    }

    handleConnection = (e) => {
      const { t } = this.props
      if (e.type === 'offline') {
        toast(t('common:offline'))
        this.setState({ online: false })
      }
      if (e.type === 'online') {
        toast(t('common:online'))
        this.setState({ online: true })
      }
    }

    render() {
      return <WrappedComponent {...this.props} online={this.state.online} />
    }
  }
}

export default withConnection
