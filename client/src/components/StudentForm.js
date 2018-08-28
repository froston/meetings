import React from 'react'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
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
  available: [],
  errors: {}
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

  validate = cb => {
    const { name } = this.state
    let errors = {}
    !name ? (errors.name = this.props.t('common:required')) : undefined
    if (Object.keys(errors).length) {
      this.setState({ errors: Object.assign({}, this.state.errors, errors) })
    } else {
      cb()
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
    this.setState({ [name]: value, errors: {} })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.validate(() => {
      const { student } = this.props
      if (student && student.id) {
        const values = { ...this.state }
        this.props.handleSubmit(student && student.id, values)
      } else {
        const values = { ...this.state }
        this.props.handleSubmit(null, values)
      }
    })
  }

  handleClose = () => {
    this.props.handleClose()
  }

  render() {
    const { t, hidden, student } = this.props
    const { name, nextPoint, available, hall, errors } = this.state
    return (
      <div>
        <Layer closer overlayClose align="right" onClose={this.handleClose} hidden={hidden}>
          <Form pad="medium" onSubmit={this.handleSubmit}>
            <Header>
              <Heading>{student ? student.name : t('new')}</Heading>
            </Header>
            <FormField label={t('nameSurname')} error={errors.name}>
              <TextInput value={name} onDOMChange={e => this.handleChange('name', e.target.value)} />
            </FormField>
            <FormField label={t('common:gender')}>
              <RadioButton
                id={consts.GENDER_BROTHER}
                label={t('brother')}
                checked={this.state.gender === consts.GENDER_BROTHER}
                onChange={e => this.handleChange('gender', consts.GENDER_BROTHER)}
              />
              <RadioButton
                id={consts.GENDER_SISTER}
                label={t('sister')}
                checked={this.state.gender === consts.GENDER_SISTER}
                onChange={e => this.handleChange('gender', consts.GENDER_SISTER)}
              />
            </FormField>
            <FormField label={t('common:available')}>
              <Select
                id="Available"
                label={t('common:available')}
                inline
                multiple
                options={consts.availableOptions}
                value={available}
                onChange={({ value }) => this.handleChange('available', value)}
              />
            </FormField>
            <FormField label={t('common:halls')}>
              <Select
                placeHolder={t('common:halls')}
                options={consts.hallsOptions}
                value={hall}
                onChange={({ value }) => this.handleChange('hall', value)}
              />
            </FormField>
            <FormField label={t('common:nextPoint')}>
              <NumberInput value={nextPoint} onChange={e => this.handleChange('nextPoint', e.target.value)} />
            </FormField>
            <Footer pad={{ vertical: 'medium' }}>
              <Button label={t('common:submit')} type="submit" primary={true} />
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

export default translate(['students', 'common'])(StudentForm)
