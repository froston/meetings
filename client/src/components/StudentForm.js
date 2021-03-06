import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import {
  Anchor,
  Box,
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
  Select,
} from 'grommet'
import { CatalogIcon } from 'grommet/components/icons/base'
import { consts } from '../utils'

const hallsOptions = [consts.HALLS_ALL, consts.HALLS_A, consts.HALLS_B]

const initState = {
  name: '',
  participate: true,
  gender: consts.GENDER_SISTER,
  hall: {},
  available: [],
  notes: '',
  errors: {},
  loading: false,
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

  validate = (cb) => {
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
      notes: student.notes || '',
      hall: { value: student.hall, label: t(`common:hall${student.hall}`) },
      loading: false,
    }
    this.setState({ ...state })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value, errors: {} })
    if (name === 'gender') {
      this.setState({ available: [] })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.validate(() => {
      this.setState({ loading: true })
      const { student } = this.props
      const values = { ...this.state }
      const newValues = Object.assign({}, values, { available: values.available.map((obj) => obj && obj.value) })
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
    const { t, hidden, student, handleTasks, online } = this.props
    const { name, available, hall, errors, gender, participate, notes, loading } = this.state
    const availableOptions = gender === consts.GENDER_SISTER ? consts.sisAvailableOptions : consts.availableOptions
    return (
      <div>
        <Layer closer overlayClose align="right" onClose={this.handleClose} hidden={hidden}>
          <Form pad="medium">
            <Header>
              <Heading>{student ? student.name : t('new')}</Heading>
            </Header>
            <FormField label={t('nameSurname')} error={errors.name}>
              <TextInput value={name} onDOMChange={(e) => this.handleChange('name', e.target.value)} />
            </FormField>
            <FormField label={t('participate')}>
              <CheckBox
                onChange={(e) => this.handleChange('participate', e.target.checked)}
                checked={participate}
                toggle
              />
            </FormField>
            <FormField>
              <RadioButton
                id={consts.GENDER_BROTHER}
                label={t('brother')}
                checked={gender === consts.GENDER_BROTHER}
                onChange={(e) => this.handleChange('gender', consts.GENDER_BROTHER)}
              />
              <RadioButton
                id={consts.GENDER_SISTER}
                label={t('sister')}
                checked={gender === consts.GENDER_SISTER}
                onChange={(e) => this.handleChange('gender', consts.GENDER_SISTER)}
              />
            </FormField>
            <FormField label={t('common:available')}>
              <Select
                id="Available"
                label={t('common:available')}
                inline
                multiple
                options={availableOptions.map((av) => ({ value: av, label: t(`common:${av}`) }))}
                value={available}
                onChange={({ value }) => this.handleChange('available', value)}
              />
            </FormField>
            <FormField label={t('common:halls')} error={errors.hall}>
              <Select
                placeHolder={t('common:halls')}
                options={hallsOptions.map((hl) => ({ value: hl, label: t(`common:hall${hl}`) }))}
                value={hall}
                onChange={({ value }) => this.handleChange('hall', value)}
              />
            </FormField>
            <FormField label={t('common:notes')}>
              <textarea
                rows={3}
                type="text"
                placeholder={t('common:notes')}
                value={notes}
                onChange={(e) => this.handleChange('notes', e.target.value)}
                maxLength={500}
              />
            </FormField>
            <Footer pad={{ vertical: 'medium' }}>
              <Box direction="row" align="center" pad={{ between: 'medium' }} responsive={false} wrap>
                <Button
                  label={t('common:submit')}
                  onClick={!loading && online ? this.handleSubmit : null}
                  primary
                  style={{ marginBottom: 15 }}
                />
                {student && (
                  <Anchor
                    icon={<CatalogIcon />}
                    label={t(`tasks`)}
                    onClick={handleTasks}
                    primary
                    style={{ marginBottom: 15 }}
                  />
                )}
              </Box>
            </Footer>
          </Form>
        </Layer>
      </div>
    )
  }
}

StudentForm.propTypes = {
  online: PropTypes.bool,
  hidden: PropTypes.bool,
  student: PropTypes.object,
  handleSubmit: PropTypes.func,
  handleClose: PropTypes.func,
  handleTasks: PropTypes.func,
}

export default withTranslation(['students', 'common'])(StudentForm)
