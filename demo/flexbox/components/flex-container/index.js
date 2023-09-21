import { containerAttrsMap } from '@/utils/constants.js'
import { createAsyncComponentWithTemplateUrl } from '@/utils/index.js'
import { useForm } from '@/hooks/useForm.js'
import FormItem from '@/components/form-item/index.js'
import FlexItem from '@/components/flex-item/index.js'

const { ref, computed } = Vue

const FlexContainer = {
  name: 'FlexContainer',
  components: {
    FlexItem,
    FormItem
  },
  setup() {
    const itemsInfo = ref({
      count: 3,
      width: 'auto',
      height: 'auto'
    })

    const { formItems, formModel, flexStyle } = useForm(containerAttrsMap)

    const otherStyle = ref({
      width: 'auto',
      height: 'auto'
    })
    const style = computed(() => ({
      ...flexStyle.value,
      ...otherStyle.value
    }))

    return {
      itemsInfo,
      formItems,
      formModel,
      otherStyle,
      style,
    }
  },
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

export default createAsyncComponentWithTemplateUrl(resolveUrl('./index.html'), FlexContainer)
