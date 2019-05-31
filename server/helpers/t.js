const t = text => {
  switch (text) {
    case 'Reading':
      return 'Lectura de la Bíblia'
    case 'Initial Call':
      return 'Primera conversación'
    case 'Return Visit':
      return 'Revisita'
    case '1. Return Visit':
      return 'Primera revisita'
    case '2. Return Visit':
      return 'Segunda revisita'
    case 'Bible Study':
      return 'Curso bíblico'
    case 'Talk':
      return 'Discruso'
    default:
      return ''
  }
}

module.exports = t
