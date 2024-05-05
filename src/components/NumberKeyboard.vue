<template>
    <div :class="keyboardClass"></div>
  </template>
  
  <script>
  import Keyboard from 'simple-keyboard'
  import 'simple-keyboard/build/css/index.css'
  
  export default {
    name: 'NumberKeyboard',
    props: {
      keyboardClass: {
        default: 'number-keyboard',
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
          default:  ['1 2 3', '4 5 6', '7 8 9', '. 0 {backspace} {ent}'],
        },
        display: {
          '{ent}': 'OK',
          '{backspace}': '⌫',
        },
      })
    },
    unmounted() {
        this.keyboard.destroy()
    },
    methods: {
      onChange(input) {
        this.$emit('onChange', input)
      },
      onKeyPress(button) {
        this.$emit('onKeyPress', button)
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
  .number-keyboard {
    max-width: 850px;
    font-size: 24px;
    text-align: center;
    width: 100%;
    color: black;
  }
  </style>
  