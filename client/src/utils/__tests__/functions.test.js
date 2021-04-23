import moment from 'moment'
import { functions } from '../'

describe('function.js', () => {
  it('formats date', () => {
    let dateString = '2017-06-15'
    let dateFormat = functions.formatDate(dateString)
    expect(dateFormat).toBe('15/6/2017')
  })

  it('formats empty date', () => {
    let dateFormat = functions.formatDate(null)
    expect(dateFormat).toBe('')
  })

  it('formats datetime', () => {
    let dateString = '2017-06-15 14:31:00'
    let dateFormat = functions.formatDateValue(dateString)
    expect(dateFormat).toBe('15/6/2017 14:31')
  })

  it('returns correct territory color', () => {
    let color
    let territory

    color = functions.getTerritoryStatusColor({}, null)
    expect(color).toBe('unknown')

    const settings = {
      terWarning: 30,
      terDanger: 90,
    }

    // assigned
    territory = {
      assigned: true,
      date_from: moment().format(),
      date_to: '',
    }

    color = functions.getTerritoryStatusColor(territory, settings)
    expect(color).toBe('graph-1')

    territory = {
      assigned: true,
      date_from: moment().subtract(90, 'days').format(),
      date_to: '',
    }
    color = functions.getTerritoryStatusColor(territory, settings)
    expect(color).toBe('critical')

    // not assigned
    territory = {
      assigned: false,
      date_from: moment().format(),
      date_to: moment().format(),
    }
    color = functions.getTerritoryStatusColor(territory, settings)
    expect(color).toBe('ok')

    territory = {
      assigned: null,
      date_from: moment().subtract(90, 'days').format(),
      date_to: moment().subtract(30, 'days').format(),
    }
    color = functions.getTerritoryStatusColor(territory, settings)
    expect(color).toBe('warning')

    territory = {
      assigned: false,
      date_from: moment().subtract(100, 'days').format(),
      date_to: moment().subtract(90, 'days').format(),
    }
    color = functions.getTerritoryStatusColor(territory, settings)
    expect(color).toBe('critical')
  })

  it('checks correctly access rights', () => {
    let hasAccess, meta

    hasAccess = functions.hasAccess()
    expect(hasAccess).toBe(false)

    meta = {
      admin: 1,
      lifeministry: 0,
      territories: 0,
      numbers: 0,
      work: 0,
    }
    hasAccess = functions.hasAccess(meta, 'lifeministry')
    expect(hasAccess).toBe(true)

    meta = {
      admin: 0,
      lifeministry: 0,
      territories: 1,
      numbers: 1,
      work: 1,
    }
    hasAccess = functions.hasAccess(meta, 'lifeministry')
    expect(hasAccess).toBe(false)

    meta = {
      admin: 0,
      lifeministry: 1,
      territories: 0,
      numbers: 1,
      work: 1,
    }
    hasAccess = functions.hasAccess(meta, 'territories')
    expect(hasAccess).toBe(false)

    meta = {
      admin: 0,
      lifeministry: 1,
      territories: 1,
      numbers: 0,
      work: 1,
    }
    hasAccess = functions.hasAccess(meta, 'numbers')
    expect(hasAccess).toBe(false)

    meta = {
      admin: 0,
      lifeministry: 1,
      territories: 0,
      numbers: 1,
      work: 0,
    }
    hasAccess = functions.hasAccess(meta, 'work')
    expect(hasAccess).toBe(false)

    meta = {
      admin: 0,
      lifeministry: 0,
      territories: 0,
      numbers: 0,
      work: 1,
    }
    hasAccess = functions.hasAccess(meta, 'work')
    expect(hasAccess).toBe(true)

    meta = {
      admin: 0,
      lifeministry: 0,
      territories: 1,
      numbers: 0,
      work: 0,
    }
    hasAccess = functions.hasAccess(meta, 'work')
    expect(hasAccess).toBe(true)

    hasAccess = functions.hasAccess(meta, 'whatever')
    expect(hasAccess).toBe(false)
  })

  it('checks correctly no access', () => {
    let hasNoAccess, meta
    hasNoAccess = functions.hasNoAccess()
    expect(hasNoAccess).toBe(true)

    hasNoAccess = functions.hasNoAccess({})
    expect(hasNoAccess).toBe(true)

    meta = {
      admin: 0,
      lifeministry: 0,
      territories: 0,
      numbers: 0,
      work: 0,
    }
    hasNoAccess = functions.hasNoAccess(meta)
    expect(hasNoAccess).toBe(true)

    meta = {
      admin: 0,
      lifeministry: 0,
      territories: 0,
      numbers: 1,
      work: 0,
    }
    hasNoAccess = functions.hasNoAccess(meta)
    expect(hasNoAccess).toBe(false)
  })
})
