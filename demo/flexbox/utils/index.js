export const createAsyncComponentWithTemplateUrl = (templateUrl, componentOptions) => {
  return Vue.defineAsyncComponent(() => {
    return fetch(templateUrl)
      .then((res) => res.text())
      .then((html) => {
        const head = document.querySelector('head')
        const div = document.createElement('div')
        div.innerHTML = html
        const childNodes = [...div.childNodes]
        let template = ''
        childNodes.forEach((node) => {
          const tagName = node.tagName?.toLowerCase() || ''
          if (template.trim() === '' && tagName === 'template') {
            template = node.innerHTML
          } else if (tagName === 'style') {
            head.appendChild(node)
          }
        })
        if (template) {
          return {
            ...componentOptions,
            template
          }
        }
        return {
          ...componentOptions
        }
      })
  })
}
