import './init'
import { createApp } from 'vue/dist/vue.esm-bundler';
import App from './App.vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
const { aliases, md } = require('vuetify/iconsets/md');
// import '@mdi/font/css/materialdesignicons.css'
import VuexStore from './store'
import { createStore } from 'vuex';
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'md',
    aliases,
    sets: {
      md,
    },
  },
})

const app = createApp(App)

app.use(vuetify)
app.use(router)
app.use(createStore(VuexStore))
app.mount('#lex-app')