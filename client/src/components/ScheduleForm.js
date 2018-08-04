import React from 'react';
import { Layer, Header, Heading, Form, FormField, Select, TextInput, Footer, Button } from 'grommet'
import moment from 'moment'
import { consts } from '../utils'

const initState = {
  month: {
    "value": moment().month(),
    "label": moment().format("MMMM")
  },
  year: moment().year()
}

class ScheduleForm extends React.PureComponent {
  state = initState

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      this.setState({ ...initState })
    }
  }
  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const values = { ...this.state, month: this.state.month.value }
    this.props.handleSubmit(values)
  }

  handleClose = () => {
    this.props.handleClose()
  }
  render() {
    const { hidden } = this.props
    const { month, year } = this.state
    return (
      <div>
        <Layer
          closer={true}
          flush={false}
          align='center'
          overlayClose={true}
          onClose={this.props.handleClose}
          hidden={hidden}
        >
          <Header size="medium">
            <Heading tag="h2" margin="medium">New Schedule</Heading>
          </Header>
          <Form pad='medium' onSubmit={this.handleSubmit}>
            <FormField label='Month'>
              <Select
                id='Month'
                label='Month'
                options={consts.monthsOptions}
                value={month}
                onChange={({ value }) => this.handleChange('month', value)}
                style={{ margin: 0 }}
              />
            </FormField>
            <FormField label='Year'>
              <TextInput
                value={year}
                onDOMChange={e => this.handleChange('year', e.target.value)}
              />
            </FormField>
            <Footer pad={{ "vertical": "medium" }}>
              <Button
                label='Submit'
                type='submit'
                primary={true}
              />
            </Footer>
          </Form>
        </Layer>
      </div>
    );
  }
}

export default ScheduleForm;
