import {ColorPicker} from "iview"
export default {
  render(h) {
    this.$attrs.value = this.$attrs.value || "";
    return h(ColorPicker,{
      on: this.$listeners,
      props: this.$attrs
    })
  }
}
