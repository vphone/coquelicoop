<template>
  <div :class="keyboardClass"></div>
</template>

<script>
import Keyboard from 'simple-keyboard'
import 'simple-keyboard/build/css/index.css'

export default {
  name: 'SimpleKeyboard',
  props: {
    keyboardClass: {
      default: 'simple-keyboard',
      type: String,
    },
    input: {
      type: String,
    },
  },
  data: () => ({
    keyboard: null,
  }),
  mounted() {
    this.keyboard = new Keyboard(this.keyboardClass, {
      onChange: this.onChange,
      onKeyPress: this.onKeyPress,
      layoutName: 'default',
      layout: {
        default: [
          'A Z E R T Y U I O P',
          'Q S D F G H J K L',
          'W X C V B N M {backspace}',
          '{numbers} {space} {ent}',
        ],
        numbers: ['1 2 3', '4 5 6', '7 8 9', '{abc} 0 {backspace} {ent}'],
      },
      display: {
        '{numbers}': '123',
        '{ent}': 'RECHERCHER',
        '{backspace}': '⌫',
        '{abc}': 'ABC',
        '{space}': 'Espace',
      },
    })
  },
  methods: {
    onChange(input) {
      this.$emit('onChange', input)
    },
    onKeyPress(button) {
      this.$emit('onKeyPress', button)

      if (button === '{numbers}' || button === '{abc}') this.handleNumbers()
    },
    handleNumbers() {
      let currentLayout = this.keyboard.options.layoutName
      let numbersToggle = currentLayout !== 'numbers' ? 'numbers' : 'default'

      this.keyboard.setOptions({
        layoutName: numbersToggle,
      })
    },
  },
  watch: {
    input(input) {
      this.keyboard.setInput(input)
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.simple-keyboard {
  max-width: 800px;
  font-size: 20px;
  text-align: center;
  width: 100%;
  color: black;
}
</style>
