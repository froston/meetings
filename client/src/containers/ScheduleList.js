import React from 'react'
import { withRouter } from 'react-router-dom'
import { Section, Box, Heading, List, ListItem, Button, Paragraph } from 'grommet'
import FormTrashIcon from 'grommet/components/icons/base/FormTrash'
import ScheduleIcon from 'grommet/components/icons/base/Schedule'
import { ScheduleForm } from '../components'
import { api } from '../utils'

class ScheduleList extends React.Component {
  state = {
    schedules: [],
    scheduleForm: true,
    submitting: false
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    api.get('/schedules').then(schedules => {
      this.setState({
        schedules: schedules || []
      })
    })
  }

  handleAdd = () => {
    this.handleForm()
  }

  handleSelect = (e, id) => {
    e.preventDefault()
    this.props.history.push(`/schedules/${id}`)
  }

  handleRemove = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Sure to remove the schedule?')) {
      api.remove('/schedules', id).then(() => {
        this.loadData()
      })
    }
  }

  handleForm = () => {
    this.setState({ scheduleForm: !this.state.scheduleForm })
  }

  handleSubmit = data => {
    this.setState({ submitting: true })
    api.post('/schedules', data).then(() => {
      this.setState({ scheduleForm: true })
      this.loadData()
      this.setState({ submitting: false })
    })
  }

  render() {
    const { schedules, scheduleForm, submitting } = this.state
    return (
      <Section>
        <Heading tag="h1" margin="small">
          Schedules
        </Heading>
        <Paragraph margin="small">Generate, update and remove schedules.</Paragraph>
        <Box pad={{ vertical: 'medium' }}>
          <Button
            icon={<ScheduleIcon />}
            label="Generate New Schedule"
            onClick={this.handleAdd}
            href="#"
          />
        </Box>
        <List selectable>
          {schedules.map((schedule, index) => (
            <ListItem
              key={schedule.id}
              pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
              justify="between"
              align="center"
              responsive={false}
              onClick={e => this.handleSelect(e, schedule.id)}
              separator={index === 0 ? 'horizontal' : 'bottom'}
            >
              <Box>
                <strong>{`${schedule.month} / ${schedule.year}`}</strong>
              </Box>
              <Box direction="row">
                <Button
                  icon={<FormTrashIcon size="medium" />}
                  onClick={e => this.handleRemove(e, schedule.id)}
                  a11yTitle="Remove Schedule"
                />
              </Box>
            </ListItem>
          ))}
        </List>
        <ScheduleForm
          hidden={scheduleForm}
          handleSubmit={this.handleSubmit}
          handleClose={this.handleForm}
          submitting={submitting}
        />
      </Section>
    )
  }
}

export default withRouter(ScheduleList)
