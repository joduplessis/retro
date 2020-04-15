
class Retro extends HTMLElement {
  style
  state
  shadowElement

  constructor(obj) {
    super()

    this.shadowElement = this.attachShadow({ mode: 'open' })
    this.shadowElement.innerHTML = this.innerHTML
  }

  static get observedAttributes() {
    return ['text'];
  }

  connectedCallback() {
    // Notify the component that things are ready
    this.ready()

    // Assign our first variables
    this.state = this.setInitialState()

    // Now that state is set
    this.processDomElementChildren(this.shadowElement)
  }

  updateState(state) {
    this.state = state
    this.processDomElementChildren(this.shadowElement)

    console.log('updateState', this.state)
  }

  processDomElementChildren(parent) {
    const children = parent.childNodes

    for (let child of children) {
      let hasValidChildren = false

      switch (child.nodeType) {
        case 1:
          this.replaceElementVariables(child)
          this.checkAttributes(child)

          // See if there are granchildren
          for (let granChild of child.childNodes) {
            if (granChild.nodeType == 1) hasValidChildren = true
          }

          if (hasValidChildren) this.processDomElementChildren(child)
          break
      }
    }
  }

  checkAttributes(el) {
    const retroClick = el.getAttribute('r:click')

    if (retroClick) el.addEventListener('click', () => eval(`this.${retroClick}`))
  }

  findStateVariableValue(variable, level) {
    for (let property in this.state) {
      if (variable == property) return this.state[property]
    }
  }

  replaceElementVariables(el) {
    let text = el.innerHTML
    const pattern = /({{([^{{}}]|)*}})/g
    const variables = text.match(pattern)

    if (variables) {
      for (let variable of variables) {
        const variableName = (variable.replace(/[{{}}]/g, ''))
        const variableValue = this.findStateVariableValue(variableName, 0)
        const re = new RegExp(variable, 'g')

        text = text.replace(re, variableValue)
      }
    }

    el.innerHTML = text
  }

  disconnectedCallback() {
    console.log('disconnectedCallback')
  }

  adoptedCallback() {
    console.log('adoptedCallback')
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (this.propsUpdate) this.propsUpdate({ attrName, oldVal, newVal })
  }
}
