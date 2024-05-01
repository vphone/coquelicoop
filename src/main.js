import { createApp } from 'vue'
import store from './store/store'
import App from './App.vue'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import router from './router'

const app = createApp(App)

app.use(Quasar, quasarUserOptions)
app.use(router)
app.use(store)
app.mount('#app')
