import { AppEnvironment } from './environment';

export const environment: AppEnvironment = {
  production: false,
  dataSource: 'mock',
  firebase: {
    enabled: false,
    config: {
      apiKey: 'dev-api-key',
      authDomain: 'dev-project.firebaseapp.com',
      projectId: 'dev-project-id',
      storageBucket: 'dev-project.firebasestorage.app',
      messagingSenderId: 'dev-messaging-sender-id',
      appId: 'dev-app-id',
    },
  },
};
