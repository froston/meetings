import React from 'react';
import Layer from 'grommet/components/Layer';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Heading from 'grommet/components/Heading';
import TextInput from 'grommet/components/TextInput';
import NumberInput from 'grommet/components/NumberInput';
import RadioButton from 'grommet/components/RadioButton';
import Select from 'grommet/components/Select';
import Button from 'grommet/components/Button';

const initState = {
  username: "",
  nextPoint: "1",
  gender: "Female",
  hall: "All",
  available: []
}

class StudentForm extends React.Component {
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
      username: student.username,
      gender: student.gender,
      available: student.available,
      hall: student.hall,
      nextPoint: student.nextPoint || 1,
    }
    this.setState({ ...state })
  }

  handleChange = (name, value) => {
    console.log(name, value)
    this.setState({ [name]: value })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const { student } = this.props
    const values = { ...this.state }
    this.props.handleSubmit(student && student._id, values)
  }

  handleClose = () => {
    this.props.handleClose()
  }

  render() {
    const { hidden, student } = this.props
    const { username, nextPoint, available, hall } = this.state
    return (
      <div>
        <Layer
          closer={true}
          flush={false}
          align='right'
          overlayClose={true}
          onClose={this.handleClose}
          hidden={hidden}
        >
          <Form pad='medium' onSubmit={this.handleSubmit}>
            <Header>
              <Heading>{student ? student.username : "New Student"}</Heading>
            </Header>
            <FormField label='Name and Surname'>
              <TextInput
                value={username}
                onDOMChange={e => this.handleChange('username', e.target.value)}
              />
            </FormField>
            <FormField label='Gender'>
              <RadioButton
                id='Male'
                label='Brother'
                checked={this.state.gender === "Male"}
                onChange={e => this.handleChange('gender', "Male")}
              />
              <RadioButton
                id='Female'
                label='Sister'
                checked={this.state.gender === "Female"}
                onChange={e => this.handleChange('gender', "Female")}
              />
            </FormField>
            <FormField label='Available'>
              <Select
                id='Available'
                label='Available'
                inline
                multiple
                options={['reading', 'initialCall', 'returnVisit', 'talk']}
                value={available}
                onChange={({ value }) => this.handleChange('available', value)}
                style={{ margin: 0 }}
              />
            </FormField>
            <FormField label='Halls'>
              <Select
                placeHolder='Halls'
                options={['All', 'A', 'B']}
                value={hall}
                onChange={({ value }) => this.handleChange('hall', value)} />
            </FormField>
            <FormField label='Next Point'>
              <NumberInput
                value={nextPoint}
                onChange={e => this.handleChange('nextPoint', e.target.value)}
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

export default StudentForm;
