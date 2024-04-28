import { createApp } from 'vue'
import store from './store/store'
import App from './App.vue'
import VueBarcode from '@chenfengyuan/vue-barcode'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'

const app = createApp(App).use(Quasar, quasarUserOptions)

app.use(store)
app.component(VueBarcode.name, VueBarcode)
app.mount('#app')