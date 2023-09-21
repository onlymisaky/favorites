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

const resolveUrl = (url = '') => {
  if (!url.startsWith('/')
    && !url.startsWith('./')
    && !url.startsWith('../')
  ) {
    return url
  }
  if (typeof import.meta.resolve === 'function') {
    return import.meta.resolve(url)
  }
  return new URL(url, import.meta.url).pathname
}

export default createAsyncComponentWithTemplateUrl(resolveUrl('./index.html'), FormItem)
