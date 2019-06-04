import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Anchor } from 'grommet'

const styles = {
  marginLeft: 'auto',
  color: '#0a64a0',
  fontWeight: 700
}

const Undo = ({ t, text, data, undo, closeToast }) => {
  const handleClick = () => {
    undo(data)
    closeToast()
  }
  return (
    <>
      <span>{text}</span>
      <Anchor onClick={handleClick} label={t(`undo`)} href="#" style={styles} />
    </>
  )
}

Undo.propTypes = {
  text: PropTypes.string.isRequired,
  undo: PropTypes.func.isRequired,
  closeToast: PropTypes.func.isRequired,
  data: PropTypes.any
}

export default translate()(Undo)
