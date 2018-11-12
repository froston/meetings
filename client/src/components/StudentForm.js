import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
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
  CheckBox,
  Select
} from 'grommet'
import { api, consts } from '../utils'

const initState = {
  id: null,
  name: '',
  participate: true,
  nextPoint: 1,
  gender: consts.GENDER_SISTER,
  hall: {},
  available: [],
  errors: {}
}

class StudentForm extends React.PureComponent {
  state = initState

  componentDidMount() {
    const { match } = this.props
    this.loadForm(match.params.id)
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

  loadForm = id => {
    const { t } = this.props
    if (id > 0) {
      api.get(`/students/${id}`).then(student => {
        const state = {
          id: student.id,
          name: student.name,
          participate: !!student.participate,
          gender: student.gender,
          available: student.available,
          hall: { value: student.hall, label: t(`common:hall${student.hall}`) },
          nextPoint: student.nextPoint || 1
        }
        this.setState({ ...state })
      })
    } else {
      this.setState({ ...initState })
    }
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.validate(() => {
      const { id } = this.state
      const values = { ...this.state }
      const newValues = Object.assign({}, values, { available: values.available.map(obj => obj && obj.value) })
      newValues.hall = this.state.hall.value
      if (id > 0) {
        api.patch('/students', id, newValues).then(() => {
          this.handleClose()
        })
      } else {
        api.post('/students', newValues).then(() => {
          this.handleClose()
        })
      }
    })
  }

  handleClose = () => {
    this.props.history.push('/students')
    this.props.handleClose()
  }

  render() {
    const { t } = this.props
    const { name, nextPoint, available, hall, errors, gender, participate } = this.state
    return (
      <div>
        <Layer closer overlayClose align="right" onClose={this.handleClose}>
          <Form pad="medium" onSubmit={this.handleSubmit}>
            <Header>
              <Heading>{name ? name : t('new')}</Heading>
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
  history: PropTypes.object,
  match: PropTypes.object,
  handleClose: PropTypes.func
}

export default translate(['students', 'common'])(withRouter(StudentForm))
