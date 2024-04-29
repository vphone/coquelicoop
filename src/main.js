import { createApp } from 'vue'
import store from './store/store'
import App from './App.vue'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'

const app = createApp(App).use(Quasar, quasarUserOptions)

app.use(store)
app.mount('#app')
