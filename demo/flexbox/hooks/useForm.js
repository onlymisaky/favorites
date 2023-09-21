import { attrTypeMap } from '@/utils/constants.js'

const { ref, computed } = Vue

export const useForm = (attrsMap) => {
  const formItemKeys = Object.keys(attrsMap)
  const formItems = formItemKeys.map((key) => {
    const { desc, type, defaultValue, enums = [] } = attrsMap[key]
    let com = 'el-input'
    if (Array.isArray(type) && type.length > 0) {
      if (type.length === 1) {
        com = {
          [attrTypeMap.string]: 'el-input',
          [attrTypeMap.number]: 'el-input-number',
          [attrTypeMap.enum]: 'el-select'
        }[type[0]]
      } else if (type.includes(attrTypeMap.enum)) {
        com = 'el-autocomplete'
      }
    }

    return {
      key, desc, com, defaultValue, enums
    }
  })
  const formModel = ref(formItemKeys.reduce((prev, key) => {
    return {
      ...prev,
      [key]: attrsMap[key].defaultValue
    }
  }, {}))

  const flexStyle = computed(() => {
    return Object.keys(formModel.value).reduce((prev, key) => {
      return {
        ...prev,
        [key]: formModel.value[key]
      }
    }, {})
  })

  return {
    formItems,
    formModel,
    flexStyle
  }
}
