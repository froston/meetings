import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Box, Menu, CheckBox, RadioButton, Form, FormField, Title, Anchor } from 'grommet'
import { FilterIcon, CloseIcon } from 'grommet/components/icons/base'

class StudentFilters extends React.PureComponent {
  render() {
    const { t, handleFilter, resetFilters, noParticipate, gender } = this.props
    const active = !!noParticipate || !!gender
    return (
      <Menu
        responsive
        icon={<FilterIcon colorIndex={active ? 'neutral-1' : ''} size="medium" />}
        closeOnClick
        size="medium"
      >
        <Box pad="medium">
          <Title style={{ marginBottom: 20 }}>{t('filters')}</Title>
          <Form>
            <FormField>
              <CheckBox
                label={t('filtersNoParticipate')}
                onChange={(e) => handleFilter('noParticipate', e.target.checked)}
                checked={noParticipate}
              />
            </FormField>
            <FormField>
              <RadioButton
                id="B"
                name="gender"
                label={t('filtersOnlyBrothers')}
                onChange={() => handleFilter('gender', 'B')}
                onClick={() => handleFilter('gender', 'B')}
                checked={gender === 'B'}
              />
              <RadioButton
                id="S"
                name="gender"
                label={t('filtersOnlySisters')}
                onChange={() => handleFilter('gender', 'S')}
                onClick={() => handleFilter('gender', 'S')}
                checked={gender === 'S'}
              />
            </FormField>
          </Form>
        </Box>
        <Anchor icon={<CloseIcon />} label={t('filtersReset')} onClick={resetFilters} style={{ margin: '15px 0' }} />
      </Menu>
    )
  }
}

StudentFilters.propTypes = {
  handleSubmit: PropTypes.func,
  noParticipate: PropTypes.bool,
  gender: PropTypes.string,
}

export default withTranslation('students')(StudentFilters)
