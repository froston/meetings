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
  RadioButton,
  CheckBox,
  Select
} from 'grommet'
import { consts } from '../utils'

const initState = {
  name: '',
  participate: true,
  gender: consts.GENDER_SISTER,
  hall: {},
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
    const { name, hall } = this.state
    let errors = {}
    if (!name) errors.name = this.props.t('common:required')
    if (!hall.value) errors.hall = this.props.t('common:required')
    if (Object.keys(errors).length) {
      this.setState({ errors: Object.assign({}, this.state.errors, errors) })
    } else {
      cb()
    }
  }

  loadForm = () => {
    const { t, student } = this.props
    const state = {
      name: student.name,
      participate: !!student.participate,
      gender: student.gender,
      available: student.available,
      hall: { value: student.hall, label: t(`common:hall${student.hall}`) }
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
      const values = { ...this.state }
      const newValues = Object.assign({}, values, { available: values.available.map(obj => obj && obj.value) })
      newValues.hall = this.state.hall.value
      if (student && student.id) {
        this.props.handleSubmit(student && student.id, newValues)
      } else {
        this.props.handleSubmit(null, newValues)
      }
    })
  }

  handleClose = () => {
    this.props.handleClose()
  }

  render() {
    const { t, hidden, student } = this.props
    const { name, available, hall, errors, gender, participate } = this.state
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
            <FormField label={t('participate')}>
              <CheckBox
                onChange={e => this.handleChange('participate', e.target.checked)}
                checked={participate}
                toggle
              />
            </FormField>
            <FormField>
              <RadioButton
                id={consts.GENDER_BROTHER}
                label={t('brother')}
                checked={gender === consts.GENDER_BROTHER}
                onChange={e => this.handleChange('gender', consts.GENDER_BROTHER)}
              />
              <RadioButton
                id={consts.GENDER_SISTER}
                label={t('sister')}
                checked={gender === consts.GENDER_SISTER}
                onChange={e => this.handleChange('gender', consts.GENDER_SISTER)}
              />
            </FormField>
            <FormField label={t('common:available')}>
              <Select
                id="Available"
                label={t('common:available')}
                inline
                multiple
                options={consts.availableOptions.map(av => ({ value: av, label: t(`common:${av}`) }))}
                value={available}
                onChange={({ value }) => this.handleChange('available', value)}
              />
            </FormField>
            <FormField label={t('common:halls')} error={errors.hall}>
              <Select
                placeHolder={t('common:halls')}
                options={consts.hallsOptions.map(hl => ({ value: hl, label: t(`common:hall${hl}`) }))}
                value={hall}
                onChange={({ value }) => this.handleChange('hall', value)}
              />
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
