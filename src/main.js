import { createApp } from 'vue'
import { default as App } from './components/App.vue';

const  app = createApp(App, { domId: 'flibber' }).mount('#app');
