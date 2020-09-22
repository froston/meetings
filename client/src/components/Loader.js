import React from 'react'
import PropTypes from 'prop-types'

const Loader = ({ loading }) => {
  return loading ? (
    <div className="grommet-loader-wrapper">
      <div className="grommet-loader" role="progressbar">
        <div className="grommet-loader-bar grommet-loader-bar1"></div>
        <div className="grommet-loader-bar grommet-loader-bar2"></div>
      </div>
    </div>
  ) : null
}

Loader.propTypes = {
  loading: PropTypes.bool,
}

export default Loader
