import React from 'react';
import Box from 'grommet/components/Box';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import Toast from 'grommet/components/Toast';
import Button from 'grommet/components/Button';
import AddIcon from 'grommet/components/icons/base/Add'
import CatalogIcon from 'grommet/components/icons/base/Catalog'
import FormTrashIcon from 'grommet/components/icons/base/FormTrash'
import { StudentForm, TalksForm } from '../components'
import { api } from '../utils';

class Students extends React.Component {
  state = {
    students: [],
    studentForm: true,
    talksForm: true,
    student: {},
    showToast: false
  }

  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    api.get('/students').then(students =>
      this.setState({ students })
    )
  }

  handleSelect = (index) => {
    this.setState({ studentForm: false, student: this.state.students[index] })
  }

  handleAdd = () => {
    this.setState({ studentForm: false, student: null })
  }

  handleTasks = (e, student) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({ talksForm: false, student })
  }

  handleRemove = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    api.remove('/students', id)
      .then(() => {
        this.setState({ showToast: true })
        this.loadData()
      })
  }

  handleForm = (formName, val) => {
    this.setState({ [formName]: val })
  }

  handleSubmit = (id, data) => {
    if (id) {
      api.patch('/students', id, data).then(() => {
        this.setState({ studentForm: true, showToast: true })
        this.loadData()
      })
    } else {
      api.post('/students', id, data).then(() => {
        this.setState({ studentForm: true, showToast: true })
        this.loadData()
      })
    }
  }

  render() {
    return (
      <div>
        <h1>Students</h1>
        <Box pad={{ vertical: 'small' }}>
          <p>Update or add new ministry school student here.</p>
        </Box>
        <Box pad={{ vertical: 'medium' }}>
          <Button
            icon={<AddIcon />}
            label='Add New Student'
            onClick={this.handleAdd}
            href='#'
          />
        </Box>
        <List selectable={true} onSelect={this.handleSelect}>
          {this.state.students.map((student, index) =>
            <ListItem
              key={student._id}
              pad={{ vertical: 'small', horizontal: 'small', between: 'small' }}
              justify="between"
              align="center"
              responsive={false}
              onClick={this.handleSelect}
              separator={index === 0 ? 'horizontal' : 'bottom'}
            >
              <Box>
                <strong>{student.username}</strong>
              </Box>
              <Box direction="row">
                <Button
                  icon={<CatalogIcon size="medium" />}
                  onClick={e => this.handleTasks(e, student)}
                  a11yTitle='See Tasks'
                />
                <Button
                  icon={<FormTrashIcon size="medium" />}
                  onClick={e => this.handleRemove(e, student._id)}
                  a11yTitle='Remove Student'
                />
              </Box>
            </ListItem>
          )}
        </List>
        <StudentForm
          hidden={this.state.studentForm}
          handleSubmit={this.handleSubmit}
          handleClose={() => this.handleForm('studentForm', true)}
          student={this.state.student}
        />
        <TalksForm
          hidden={this.state.talksForm}
          student={this.state.student}
          handleClose={() => this.handleForm('talksForm', true)}
        />
        {
          this.state.showToast &&
          <Toast
            status='ok'
            onClose={() => this.setState({ showToast: false })}
          >
            Student information has been succesfully saved.
          </Toast>
        }
      </div>
    );
  }
}

export default Students;
