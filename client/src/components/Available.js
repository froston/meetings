import React from 'react'
import { Layer, Box, Heading, List, ListItem } from 'grommet'

class Available extends React.PureComponent {
  render() {
    const { availables, hidden, handleSelect, handleClose } = this.props
    return (
      <Layer closer overlayClose align="right" onClose={handleClose} hidden={hidden}>
        <Heading tag="h2" margin="medium">
          Available Students
        </Heading>
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

export default Available
