/*
Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file
except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS"
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the
License for the specific language governing permissions and limitations under the License.
*/

/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

/**
 * Entry point to the lex-web-ui Vue plugin
 * Exports Loader as the plugin constructor
 * and Store as store that can be used with Vuex.Store()
 */
import { CognitoIdentityCredentials }
  from 'aws-sdk/global';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import LexRuntime from 'aws-sdk/clients/lexruntime';
// import LexRuntimeV2 from 'aws-sdk/clients/lexruntimev2';
import { LexRuntimeV2Client as LexRuntimeV2 }  from '@aws-sdk/client-lex-runtime-v2';
import Polly from 'aws-sdk/clients/polly';

import LexWeb from './components/LexWeb';
import VuexStore from './store';
import { config as defaultConfig, mergeConfig } from '@/config';
import { createApp, defineAsyncComponent } from 'vue';
import 'vuetify/styles'
import * as Vuetify from 'vuetify'
import { aliases, md } from 'vuetify/iconsets/md';
import { createStore } from 'vuex';

const defineAsyncComponentInstance = (window.Vue) ? window.Vue.defineAsyncComponent : defineAsyncComponent;
/**
 * Vue Component
 */
const Component = {
  name: 'lex-web-ui',
  //template: '<lex-web v-on="$listeners"></lex-web>',
  template: '<lex-web></lex-web>',
  components: { LexWeb },
};

const loadingComponent = {
  template: '<p>Loading. Please wait...</p>',
};
const errorComponent = {
  template: '<p>An error ocurred...</p>',
};

// //Get credentials

// async function getCredentials(context) {
//   console.log('context', context.cognito.poolId);
//   const credentialProvider = fromCognitoIdentityPool({
//     identityPoolId: context.cognito.poolId,
//     clientConfig: { region: context.region || context.cognito.poolId.split(':')[0] || 'us-east-1'},
//   })
//   const credentials = await credentialProvider()
//   return credentials
// }

// const credsv3 = await getCredentials(defaultConfig)

export const testComponent = {
  template: '<div>I am async!</div>',
};

/**
 * Vue Asynchonous Component
 */
export const AsyncComponent = defineAsyncComponentInstance({
  loader: () => Promise.resolve(Component),
  delay: 200,
  timeout: 10000,
  errorComponent: errorComponent,
  loadingComponent: loadingComponent
})

/**
 * Vue Plugin
 */
export const Plugin = {
  install(app, {
    name = '$lexWebUi',
    componentName = 'lex-web-ui',
    awsConfig,
    // lexRuntimeClient,
    // pollyClient,
    component = AsyncComponent,
    config = defaultConfig,
  }) {
    const value = {
      config,
      awsConfig,
      // lexRuntimeClient,
      // pollyClient,
    };
    // add custom property to Vue
    // for example, access this in a component via this.$lexWebUi
    app.config.globalProperties[name] = value;
    // register as a global component
    app.component(componentName, component);
  },
};

export const Store = VuexStore;

/**
 * Main Class
 */
export class Loader {
  constructor(config = {}) {
    const createAppInstance = (window.Vue) ? window.Vue.createApp : createApp;
    if (!createAppInstance) {
      throw new Error('unable to find vue');
    }
    const vuexCreateStore = (window.Vuex) ? window.Vuex.createStore : createStore;
    if (!vuexCreateStore) {
      throw new Error('unable to find vuex');
    }
    const vuetifyInstance = (window.Vuetify) ? window.Vuetify : Vuetify;
    if (!vuetifyInstance) {
      throw new Error('unable to find vuetify');
    }
    const { components, directives } = vuetifyInstance;

    const vuetify = vuetifyInstance.createVuetify({
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
    const app = createAppInstance({
      template: '<div id="lex-web-ui"><lex-web-ui/></div>',
    })

    app.use(vuetify)
    const store = vuexCreateStore(VuexStore)
    this.store = store
    app.use(store)
    this.app = app;

    const mergedConfig = mergeConfig(defaultConfig, config);

    // const AWSConfigConstructor = (window.AWS && window.AWS.Config) ?
    //   window.AWS.Config :
    //   AWSConfig;

    console.log(window.AWS)
    const CognitoConstructor = window.AWS.CognitoIdentityCredentials;
      // (window && window.AWS.CognitoIdentityCredentials) ?
      //   window.AWS.CognitoIdentityCredentials :
      //   CognitoIdentityCredentials;

    // const PollyConstructor = (window.AWS && window.AWS.Polly) ?
    //   window.AWS.Polly :
    //   Polly;

    // const LexRuntimeConstructor = (window.AWS && window.AWS.LexRuntime) ?
    //   window.AWS.LexRuntime :
    //   LexRuntime;

    // const LexRuntimeConstructorV2 = LexRuntimeV2;

    // if (!CognitoConstructor || !PollyConstructor
    //   || !LexRuntimeConstructor ) {
    //   throw new Error('unable to find AWS SDK');
    // }

    const credentials = new CognitoConstructor(
      { IdentityPoolId: mergedConfig.cognito.poolId },
      { region: mergedConfig.region || mergedConfig.cognito.poolId.split(':')[0] || 'us-east-1' },
    );
    
    console.log('region', mergedConfig.region || mergedConfig.cognito.poolId.split(':')[0] || 'us-east-1' )
    const credentialsv3 = this.getCredentials(mergedConfig);

    console.log('credentials v2', credentials);
    console.log('credentials v3', credentialsv3);
    // // console.log('credsv3', credsv3)

    
    const AWSConfigConstructor = {
      region: mergedConfig.region || mergedConfig.cognito.poolId.split(':')[0] || 'us-east-1',
      credentials,
    };

    // const lexRuntimeClient = new LexRuntimeConstructor(AWSConfigConstructor);
    // // const lexRuntimeV2Client = new LexRuntimeConstructorV2(AWSConfigConstructor);
    // /* eslint-disable no-console */
    // const pollyClient = (
    //   typeof mergedConfig.recorder === 'undefined' ||
    //   (mergedConfig.recorder && mergedConfig.recorder.enable !== false)
    // ) ? new PollyConstructor(AWSConfigConstructor) : null;

    app.use(Plugin, {
      config: mergedConfig,
      awsConfig: AWSConfigConstructor,
      // lexRuntimeClient,
      // pollyClient,
    });
    this.app = app;
  }

  async getCredentials(context) {
    console.log('context', context.cognito.poolId);
    const credentialProvider = fromCognitoIdentityPool({
      identityPoolId: context.cognito.poolId,
      clientConfig: { region: context.region || context.cognito.poolId.split(':')[0] || 'us-east-1'},
    })
    const credentials = await credentialProvider()
    return credentials
  }

  // (function () {
  //   // …
  // })();
  

  // (async () => {
  //   const stream = await getFileStream("https://domain.name/path/file.ext");
  //   for await (const chunk of stream) {
  //     console.log({ chunk });
  //   }
  // })();

}
