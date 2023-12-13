import './init'
import { createApp } from 'vue'


import App from './App.vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { createRouter, createWebHashHistory } from 'vue-router'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
const { aliases, mdi } = require('vuetify/iconsets/mdi');
//import router from '@/router';
import { Buffer } from 'buffer'

import * as Vue from 'vue'
import * as Vuex from 'vuex'
import { Config as AWSConfig, CognitoIdentityCredentials } from 'aws-sdk/global'
import * as LexRuntime from 'aws-sdk/clients/lexruntime'
import * as LexRuntimeV2 from 'aws-sdk/clients/lexruntimev2'
import * as Polly from 'aws-sdk/clients/polly'

import LexWeb from './components/LexWeb.vue'
import VuexStore from './store'
import router from '@/router';
import {Plugin} from './lex-web-ui'
import { createStore } from 'vuex';

import { config as defaultConfig, mergeConfig } from './config'
// import router from './router'

// Vuetify

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})

//global.Buffer = Buffer

const app = createApp(App)

app.use(vuetify)
// const router = createRouter({
//   history: createWebHashHistory(process.env.BASE_URL),
//   routes: [
//     {
//       path: '/',
//       name: 'LexWeb',
//       component: require('./components/LexWeb.vue').default,
//     }
//   ]
// });
app.use(router)
app.use(createStore(VuexStore))
console.log("Mounting App")
app.mount('#lex-app')

export class Loader {
  constructor(config = {}) {
    console.log(`Config Received ${JSON.stringify(config)}`);
    const mergedConfig = mergeConfig(defaultConfig, config);

    // const VueConstructor = (window.Vue) ? window.Vue : Vue;
    // if (!VueConstructor) {
    //   throw new Error('unable to find Vue');
    // }

    // const VuexConstructor = (window.Vuex) ? window.Vuex : Vuex;
    // if (!VuexConstructor) {
    //   throw new Error('unable to find Vuex');
    // }

    const AWSConfigConstructor = (window.AWS && window.AWS.Config) ?
      window.AWS.Config :
      AWSConfig;

    const CognitoConstructor =
      (window.AWS && window.AWS.CognitoIdentityCredentials) ?
        window.AWS.CognitoIdentityCredentials :
        CognitoIdentityCredentials;

    const PollyConstructor = (window.AWS && window.AWS.Polly) ?
      window.AWS.Polly :
      Polly;

    const LexRuntimeConstructor = (window.AWS && window.AWS.LexRuntime) ?
      window.AWS.LexRuntime :
      LexRuntime;

    const LexRuntimeConstructorV2 = (window.AWS && window.AWS.LexRuntimeV2) ?
      window.AWS.LexRuntimeV2 :
      LexRuntimeV2;

    if (!AWSConfigConstructor || !CognitoConstructor || !PollyConstructor
      || !LexRuntimeConstructor || !LexRuntimeConstructorV2) {
      throw new Error('unable to find AWS SDK');
    }

    const credentials = new CognitoConstructor(
      { IdentityPoolId: mergedConfig.cognito.poolId },
      { region: mergedConfig.region || mergedConfig.cognito.poolId.split(':')[0] || 'us-east-1' },
    );

    const awsConfig = new AWSConfigConstructor({
      region: mergedConfig.region || mergedConfig.cognito.poolId.split(':')[0] || 'us-east-1',
      credentials,
    });

    const lexRuntimeClient = new LexRuntimeConstructor(awsConfig);
    const lexRuntimeV2Client = new LexRuntimeConstructorV2(awsConfig);
    /* eslint-disable no-console */
    const pollyClient = (
      typeof mergedConfig.recorder === 'undefined' ||
      (mergedConfig.recorder && mergedConfig.recorder.enable !== false)
    ) ? new PollyConstructor(awsConfig) : null;

    //this.store = new VuexConstructor.Store({ ...VuexStore });

    app.use(Plugin, {
      config: mergedConfig,
      awsConfig,
      lexRuntimeClient,
      lexRuntimeV2Client,
      pollyClient,
    });
  }
}