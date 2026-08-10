import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import './style.css';
import App from './App.vue';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#0f1117',
          surface: '#1a1d27',
          'surface-variant': '#252837',
          primary: '#7c6af7',
          'primary-darken-1': '#5a4fd4',
          secondary: '#3ecfcf',
          accent: '#f471b5',
          error: '#ff5370',
          warning: '#ffba3b',
          info: '#5cacff',
          success: '#4caf88',
        },
      },
    },
  },
  defaults: {
    VBtn: { variant: 'elevated', rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VCard: { rounded: 'xl' },
  },
});

createApp(App).use(vuetify).mount('#app');
