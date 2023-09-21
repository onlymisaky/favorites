import { itemAttrsMap } from '@/utils/constants.js'
import { createAsyncComponentWithTemplateUrl } from '@/utils/index.js'
import { useForm } from '@/hooks/useForm.js'
import FormItem from '@/components/form-item/index.js'

const { watch, ref, computed } = Vue

const FlexItem = {
  name: 'FlexItem',
  props: {
    index: Number,
    width: Number,
    height: Number,
  },
  components: {
    FormItem
  },
  setup(props,) {
    const { formItems, formModel, flexStyle } = useForm(itemAttrsMap)

    const otherStyle = ref({
      width: 'auto',
      height: 'auto'
    })
    watch(() => props.width, (width) => { otherStyle.value.width = width })
    watch(() => props.height, (height) => { otherStyle.value.height = height })
    const style = computed(() => ({
      ...flexStyle.value,
      ...otherStyle.value
    }))

    return {
      formItems,
      formModel,
      otherStyle,
      style
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

export default createAsyncComponentWithTemplateUrl(resolveUrl('./index.html'), FlexItem)
