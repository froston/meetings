import moment from 'moment'
import { consts } from './'

export const formatDateValue = (date) => {
  return date ? moment(date).format(consts.DATE_FORMAT) : ''
}
