import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Heading, Box, Button } from 'grommet'
import { LikeIcon, LogoutIcon } from 'grommet/components/icons/base'
import { withAuth } from '../utils'

const Worked = (props) => {
  const logout = () => {
    props.auth.logout().then(() => {
      props.history.push({
        pathname: '/',
        state: { message: props.t('logoutSuccessfull') },
      })
    })
  }
  return (
    <Box justify="center" align="center" margin="large">
      <LikeIcon size="xlarge" colorIndex="neutral-1" type="status" />
      <Heading uppercase tag="h1" margin="large" align="center">
        {props.t('workedMessage')}
      </Heading>
      <Button label="Cerrar sesión" primary onClick={logout} icon={<LogoutIcon />} />
    </Box>
  )
}

Worked.propTypes = {
  auth: PropTypes.object,
  history: PropTypes.object,
}

export default withTranslation()(withAuth(Worked))
