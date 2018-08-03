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
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
import CheckmarkIcon from 'grommet/components/icons/base/Checkmark'
import CloseIcon from 'grommet/components/icons/base/Close'

import moment from 'moment'

class TalksForm extends React.Component {
  state = {
    tasks: []
  }

  componentDidUpdate(prevProps) {
    if (prevProps.hidden !== this.props.hidden) {
      if (this.props.student) {
        this.setState({ tasks: this.props.student.tasks })
      } else {
        this.setState({ tasks: [] })
      }
    }
  }

  render() {
    const { hidden, student } = this.props
    const { tasks } = this.state;
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
            <Heading margin="medium">Tasks</Heading>
          </Header>
          <Table style={{ minWidth: 750 }}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Date</th>
                <th>Point</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length && tasks.map((task, index) =>
                <TableRow key={index}>
                  <td>{task.task}</td>
                  <td>{moment(task.date).format("DD/MM/YYYY")}</td>
                  <td>{task.point}</td>
                  <td className='secondary'>{task.completed ? <CheckmarkIcon /> : <CloseIcon />}</td>
                </TableRow>
              )}
            </tbody>
          </Table>
        </Layer>
      </div>
    );
  }
}

export default TalksForm;
