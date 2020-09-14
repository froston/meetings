import React from 'react'
import PropTypes from 'prop-types'
import { Route, Redirect } from 'react-router-dom'
import { functions } from '../utils'

const AuthRoute = ({ component: Component, meta, access, ...rest }) => (
  <Route
    {...rest}
    render={(props) => (functions.hasAccess(meta, access) ? <Component {...props} meta={meta} /> : <Redirect to="/" />)}
  />
)

AuthRoute.propTypes = {
  component: PropTypes.func.isRequired,
  location: PropTypes.object,
  meta: PropTypes.object,
  access: PropTypes.string,
}

AuthRoute.defaultProps = {
  location: {},
}

export default AuthRoute
