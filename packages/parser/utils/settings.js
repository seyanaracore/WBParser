import { settings } from './getParams.js'

// Установим начальные значения для типов
const settingsObj = {
  url: '',
  sorting: '',
  initialIterationPage: '',
  productsCountPerPage: '',
  pagesHandlingCount: '',
  includePrevProducts: 0,
}

Object.entries(settings).forEach(([key, { value }]) => {
  settingsObj[key] = isNaN(+value) ? value : +value
})
export default settingsObj
