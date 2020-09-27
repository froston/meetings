import React from 'react'
import { Button } from 'grommet'

const Badge = ({ label }) => {
  return (
    <Button
      label={label}
      href="#"
      style={{
        padding: '2px 10px',
        fontSize: '0.8rem',
        lineHeight: 1,
        textTransform: 'lowercase',
        verticalAlign: 'middle',
      }}
    />
  )
}
export default Badge
