import React from 'react'
import firebase from 'firebase'

const config = {
  apiKey: 'AIzaSyDKlRap6snQ3T4wZQuZFEcFD4SUQzMquiU',
  authDomain: 'vida-y-ministerio-autodromo.firebaseapp.com',
}

firebase.initializeApp(config)

const withAuth = (WrappedComponent) => {
  return class extends React.Component {
    componentDidMount() {
      firebase
        .auth()
        .getRedirectResult()
        .then((res) => {
          if (res.user) {
            this.forceUpdate()
          }
        })
    }

    signin() {
      const provider = new firebase.auth.GoogleAuthProvider()
      return firebase.auth().signInWithRedirect(provider)
    }

    logout() {
      return firebase.auth().signOut()
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          auth={{
            isSignedIn: !!firebase.auth().currentUser,
            user: firebase.auth().currentUser,
            signIn: this.signin,
            logout: this.logout,
          }}
        />
      )
    }
  }
}

export default withAuth
