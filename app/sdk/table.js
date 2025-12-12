
// 将rules转换为搜索条件语句
function valueToSearch (values, options) {
  if (!values) {
		return undefined
	}
  let beforePath = (options?.path || []).join('.')
  beforePath = beforePath ? beforePath + '.' : beforePath

	const newvalues = {}
	Object.keys(values).forEach(key => {
		const item = values[key]
		const moduleType = key.split('_')[0]
		if ([ 'inputNumber', 'rate', 'slider', 'calculateNumber' ].includes(moduleType)) {
			if (item?.filter(Boolean).length) {
				const start = item[0] || Number.MIN_SAFE_INTEGER
				const end = item[1] || Number.MAX_SAFE_INTEGER
        newvalues[beforePath + key] = { $gte: start, $lte: end }
			}
		} else if ([ 'datePicker', ].includes(moduleType)) {
			if (item?.filter(Boolean).length) {
				const start = item[0] || 0
				const end = item[1] ? item[1] + 86400000 : Number.MAX_SAFE_INTEGER
        newvalues[beforePath + key] = { $gte: start, $lt: end }
			}
		} else if ([ 'checkbox', 'multipleSelect', ].includes(moduleType)) {
			if (item?.length) {
        newvalues[beforePath + key] = { $in: item }
			}
		} else if ([ 'radio', 'select', ].includes(moduleType)) {
			if (item) {
        newvalues[beforePath + key] = item
			}
		} else if ([ 'switch', ].includes(moduleType)) {
			if (typeof item === 'boolean') {
        newvalues[beforePath + key] = item
			}
		} else if ([ 'organizationSelect', 'userSelect', ].includes(moduleType)) {
			if (item) {
        newvalues[beforePath + key] = item?.value
			}
		} else if ([ 'relation', ].includes(moduleType)) {
			if (item) {
        newvalues[beforePath + key] = item?.value
			}
		} else if ([ 'transfer', ].includes(moduleType)) {
			if (item) {
        newvalues[beforePath + key] = { $in: item }
			}
		} else if ([ 'json', ].includes(moduleType)) {
      // 这里有待验证写法对不对
			if (item) {
        Object.keys(item).forEach(a => {
          const path = [ key ].concat(a.split('.')).join('.')
          newvalues[beforePath + path] = item
        })
			}
		} else {
      if (item) {
        newvalues[beforePath + key] = { $regex: new RegExp(item) }
      }
		}
	})
	return newvalues
}

// const fieldTypeMap = {
// 	address: ,
// 	calculateNumber: Number,
// 	cascader: Array,
// 	checkbox: Array,
// 	codeEditor: String,
// 	datePicker: Number,
// 	dateRangePicker: Array,
// 	email: String,
// 	input: String,
// 	inputNumber: Number,
// 	json: mongoose.Schema.Types.Mixed,
// 	location: mongoose.Schema.Types.Mixed,
// 	multipleSelect: Array,

// }
// 数字格式的字段
const numberFields = [
	'calculateNumber',
	'datePicker',
	'inputNumber',
	'slider',
	'rate',
]

module.exports = {
  valueToSearch,
	numberFields,
}