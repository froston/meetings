import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Layer, Heading, Paragraph, Box, Button } from 'grommet'
import { CheckmarkIcon, StopFillIcon, CloseIcon } from 'grommet/components/icons/base'
import { functions } from '../utils'

const ConfirmWork = (props) => {
  const { t, hidden, handleClose, numbers, assigned, territory, date_from, date_to } = props
  const numberArr = Object.entries(numbers)
  const noChanges = numberArr.filter(([key, value]) => !!value.status).length == 0
  return (
    <Layer closer overlayClose align="center" onClose={handleClose} hidden={hidden}>
      <Box full="vertical" responsive direction="column" justify="center" margin={{ vertical: 'medium' }}>
        <Heading>{t('workConfirm')}</Heading>
        <Paragraph>{t('workConfirmText')}</Paragraph>
        <Heading tag="h5">
          <strong>{t('territory')}:</strong> {territory.number}
        </Heading>
        <Heading tag="h5">
          <strong>{t('assigned')}:</strong> {assigned}
        </Heading>
        <Heading tag="h5">
          <strong>{t('date_from')}:</strong> {date_from}
        </Heading>
        <Heading tag="h5">
          <strong>{t('date_to')}:</strong> {date_to}
        </Heading>
        <Box margin={{ vertical: 'small' }}>
          <Heading tag="h5">
            <strong>{t('numbers')}:</strong>
          </Heading>
          {noChanges && (
            <Heading tag="h5" uppercase>
              {t('workNoNumbers')}
            </Heading>
          )}
          {numberArr.map(([key, num]) => {
            if (!num.status) return null
            return (
              <Heading tag="h5" key={key}>
                <StopFillIcon size="xsmall" colorIndex={functions.getNumberStatusColor(num.status)} />
                <span>
                  <strong> {num.number} - </strong>
                  {t(`common:status${num.status}`)} {num.details && `(${num.details})`}
                </span>
              </Heading>
            )
          })}
        </Box>
        <Box direction="column">
          <Box margin={{ vertical: 'small' }}>
            <Button label={t('common:confirm')} icon={<CheckmarkIcon />} onClick={props.handleSubmit} primary />
          </Box>
          <Box margin={{ vertical: 'small' }}>
            <Button label={t('common:return')} icon={<CloseIcon />} onClick={props.handleClose} href="#" />
          </Box>
        </Box>
      </Box>
    </Layer>
  )
}

ConfirmWork.propTypes = {
  hidden: PropTypes.bool,
  handleClose: PropTypes.func,
  handleSubmit: PropTypes.func,
}

export default withTranslation(['territories', 'common'])(ConfirmWork)
