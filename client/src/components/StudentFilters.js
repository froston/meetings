import React from 'react'
import PropTypes from 'prop-types'
import { Box, Menu, CheckBox, RadioButton, Form, FormField, Title, Anchor } from 'grommet'
import { FilterIcon, CloseIcon } from 'grommet/components/icons/base'

class StudentFilters extends React.PureComponent {
  render() {
    const { handleFilter, resetFilters, noParticipate, gender } = this.props
    const active = !!noParticipate || !!gender
    return (
      <Menu
        responsive
        icon={<FilterIcon colorIndex={active ? 'brand' : 'plain'} size="medium" />}
        closeOnClick={false}
        size='medium'
      >
        <Box pad="medium">
          <Title style={{ marginBottom: 20 }}>Student Filters</Title>
          <Form>
            <FormField>
              <CheckBox
                label='Only non-participating'
                onChange={e => handleFilter('noParticipate', e.target.checked)}
                checked={noParticipate}
              />
            </FormField>
            <FormField>
              <RadioButton
                id='B'
                name='gender'
                label='Only brothers'
                onChange={() => handleFilter('gender', 'B')}
                onClick={() => handleFilter('gender', 'B')}
                checked={gender === "B"}
              />
              <RadioButton
                id='S'
                name='gender'
                label='Only sisters'
                onChange={() => handleFilter('gender', 'S')}
                onClick={() => handleFilter('gender', 'S')}
                checked={gender === "S"}
              />
            </FormField>
          </Form>

        </Box>
        <Anchor icon={<CloseIcon />} label='Reset Filters' onClick={resetFilters} />

      </Menu>
    )
  }
}

StudentFilters.propTypes = {
  handleSubmit: PropTypes.func,
  noParticipate: PropTypes.bool,
  gender: PropTypes.string,
}

export default StudentFilters