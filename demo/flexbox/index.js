import FlexContainer from '@/components/flex-container/index.js'

const { createApp } = Vue

const app = createApp({
  template: '<flex-container />',
  components: {
    FlexContainer
  },
})
app.use(ElementPlus)
app.mount('#app')
