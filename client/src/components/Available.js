import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { Layer, Box, Heading, List, ListItem, Paragraph } from 'grommet'

class Available extends React.PureComponent {
  render() {
    const { t, availables, hidden, handleSelect, handleClose } = this.props
    return (
      <Layer closer overlayClose align="right" onClose={handleClose} hidden={hidden}>
        <Heading tag="h2" margin="medium">
          {t('available')}
        </Heading>
        <Paragraph>{t('students:sort')}</Paragraph>
        <List selectable style={{ minWidth: 550 }}>
          {availables.map((student, index) => (
            <ListItem
              key={student.id}
              pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
              justify="between"
              align="center"
              responsive={false}
              onClick={() => handleSelect(student)}
              separator={index === 0 ? 'horizontal' : 'bottom'}
            >
              <Box>
                <strong>{student.name}</strong>
              </Box>
            </ListItem>
          ))}
        </List>
      </Layer>
    )
  }
}

Available.propTypes = {
  availables: PropTypes.array,
  hidden: PropTypes.bool,
  handleSelect: PropTypes.func,
  handleClose: PropTypes.func
}

export default translate('students')(Available)
