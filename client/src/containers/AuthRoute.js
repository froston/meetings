import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import { functions } from '../utils'

const AuthRoute = ({ component: Component, meta, access, ...rest }) => (
  <Route {...rest} render={(props) => functions.hasAccess(meta, access) && <Component {...props} />} />
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
