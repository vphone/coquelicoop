import { createApp } from 'vue'
import store from './store/store'
import App from './App.vue'
import VueBarcode from '@chenfengyuan/vue-barcode'

const app = createApp(App)

app.use(store)
app.component(VueBarcode.name, VueBarcode)
app.mount('#app')
