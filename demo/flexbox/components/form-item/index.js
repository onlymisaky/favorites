import { createAsyncComponentWithTemplateUrl } from '@/utils/index.js'

const { computed } = Vue

const FormItem = {
  name: 'FormItem',
  props: {
    label: String,
    desc: String,
    prop: String,
    formType: String,
    enums: [Array],
    modelValue: [String, Number]
  },
  setup(props, ctx) {
    const value = computed({
      get() {
        return props.modelValue
      },
      set(val) {
        ctx.emit('update:modelValue', val)
      }
    })

    const queryEnums = (qs, cb) => {
      let res = []
      if (qs && qs.trim()) {
        res = props.enums.filter((item) => item.includes(`${qs}`.trim()))
      } else {
        res = props.enums
      }
      cb(res.map((value) => ({ value })))
    }

    return {
      value,
      queryEnums
    }
  }
}


export default createAsyncComponentWithTemplateUrl('./index.html', FormItem)
