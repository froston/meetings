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

class StudentForm extends React.Component {
  state = {
    username: "",
    nextPoint: "",
    gender: "",
    available: []
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      this.loadForm()
      console.log(this.props.student)
    }
  }

  loadForm = () => {
    const { student } = this.props
    const state = {
      username: student.username,
      gender: student.gender,
      available: student.available,
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
    const values = { ...this.state }
    this.props.handleSubmit(this.props.student._id, values)
  }

  render() {
    const { hidden, handleClose, student } = this.props
    const { username, nextPoint, available } = this.state
    return (
      <div>
        {student &&
          <Layer
            closer={true}
            flush={false}
            align='right'
            overlayClose={true}
            onClose={handleClose}
            hidden={hidden}
          >
            <Form pad='medium' onSubmit={this.handleSubmit}>
              <Header>
                <Heading>{student.username}</Heading>
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
              <FormField label='Next Point'>
                <NumberInput
                  value={nextPoint}
                  onChange={e => this.handleChange('nextPoint', e.target.value)}
                />
              </FormField>
              <FormField label='Available'>
                <Select
                  inline={true}
                  multiple={true}
                  options={['reading', 'initialCall', 'returnVisit', 'talk']}
                  value={available}
                  onChange={({ value }) => this.handleChange('available', value)} />
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
        }
      </div>
    );
  }
}

export default StudentForm;
