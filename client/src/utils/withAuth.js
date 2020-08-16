import React from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTHDOMAIN,
}

firebase.initializeApp(config)

const withAuth = (WrappedComponent) => {
  return class extends React.Component {
    componentDidMount() {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
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
      const auth = firebase.auth()
      return (
        <WrappedComponent
          {...this.props}
          auth={{
            firebaseAuth: auth,
            isSignedIn: !!auth.currentUser,
            user: auth.currentUser,
            signIn: this.signin,
            logout: this.logout,
          }}
        />
      )
    }
  }
}

export default withAuth
