export type AppDataSource = 'mock' | 'firebase';

export interface FirebaseAppConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface AppEnvironment {
  production: boolean;
  dataSource: AppDataSource;
  firebase: {
    enabled: boolean;
    config: FirebaseAppConfig;
  };
}

export const environment: AppEnvironment = {
  production: true,
  dataSource: 'mock',
  firebase: {
    enabled: false,
    config: {
      apiKey: 'your-api-key',
      authDomain: 'your-project.firebaseapp.com',
      projectId: 'your-project-id',
      storageBucket: 'your-project.firebasestorage.app',
      messagingSenderId: 'your-messaging-sender-id',
      appId: 'your-app-id',
    },
  },
};
