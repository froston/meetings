import React from 'react'
import { StopFillIcon } from 'grommet/components/icons/base'
import { functions } from '../utils'

const ColorOption = ({ status, text, option = false }) => {
  const styles = !option ? { padding: '11px 23px', height: 36, lineHeight: '36px' } : {}
  return (
    <span style={styles}>
      <StopFillIcon size="xsmall" colorIndex={functions.getNumberStatusColor(status)} />
      {` ${text}`}
    </span>
  )
}

export default ColorOption
