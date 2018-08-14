import React from 'react'
import PropTypes from 'prop-types'
import {
  Layer,
  Form,
  FormField,
  Header,
  Heading,
  Footer,
  Button,
  TextInput,
  NumberInput,
  RadioButton,
  Select
} from 'grommet'
import { consts } from '../utils'

const initState = {
  name: '',
  nextPoint: 1,
  gender: consts.GENDER_SISTER,
  hall: consts.HALLS_ALL,
  available: []
}

class StudentForm extends React.PureComponent {
  state = initState

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      if (this.props.student) {
        this.loadForm()
      } else {
        this.setState({ ...initState })
      }
    }
  }

  loadForm = () => {
    const { student } = this.props
    const state = {
      name: student.name,
      gender: student.gender,
      available: student.available,
      hall: student.hall,
      nextPoint: student.nextPoint || 1
    }
    this.setState({ ...state })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }

  handleSubmit = e => {
    e.preventDefault()
    const { student } = this.props
    if (student && student.id) {
      const values = { ...this.state }
      this.props.handleSubmit(student && student.id, values)
    } else {
      const values = { ...this.state }
      this.props.handleSubmit(null, values)
    }
  }

  handleClose = () => {
    this.props.handleClose()
  }

  render() {
    const { hidden, student } = this.props
    const { name, nextPoint, available, hall } = this.state
    return (
      <div>
        <Layer closer overlayClose align="right" onClose={this.handleClose} hidden={hidden}>
          <Form pad="medium" onSubmit={this.handleSubmit}>
            <Header>
              <Heading>{student ? student.name : 'New Student'}</Heading>
            </Header>
            <FormField label="Name and Surname">
              <TextInput
                value={name}
                onDOMChange={e => this.handleChange('name', e.target.value)}
              />
            </FormField>
            <FormField label="Gender">
              <RadioButton
                id={consts.GENDER_BROTHER}
                label="Brother"
                checked={this.state.gender === consts.GENDER_BROTHER}
                onChange={e => this.handleChange('gender', consts.GENDER_BROTHER)}
              />
              <RadioButton
                id={consts.GENDER_SISTER}
                label="Sister"
                checked={this.state.gender === consts.GENDER_SISTER}
                onChange={e => this.handleChange('gender', consts.GENDER_SISTER)}
              />
            </FormField>
            <FormField label="Available">
              <Select
                id="Available"
                label="Available"
                inline
                multiple
                options={consts.availableOptions}
                value={available}
                onChange={({ value }) => this.handleChange('available', value)}
              />
            </FormField>
            <FormField label="Halls">
              <Select
                placeHolder="Halls"
                options={consts.hallsOptions}
                value={hall}
                onChange={({ value }) => this.handleChange('hall', value)}
              />
            </FormField>
            <FormField label="Next Point">
              <NumberInput
                value={nextPoint}
                onChange={e => this.handleChange('nextPoint', e.target.value)}
              />
            </FormField>
            <Footer pad={{ vertical: 'medium' }}>
              <Button label="Submit" type="submit" primary={true} />
            </Footer>
          </Form>
        </Layer>
      </div>
    )
  }
}

StudentForm.propTypes = {
  hidden: PropTypes.bool,
  student: PropTypes.object,
  handleSubmit: PropTypes.func,
  handleClose: PropTypes.func
}

export default StudentForm
