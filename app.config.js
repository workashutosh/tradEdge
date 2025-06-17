module.exports = () => ({
  name: 'TradEdge',
  slug: 'tradedge',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/logo.png',
  scheme: 'tradedge',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  owner: 'najaf1705',

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.tradedge.app',
  },

  android: {
    package: 'com.tradedge.app',
    versionCode: 1,
    googleServicesFile: './android/app/google-services.json',
    icon: './assets/images/logo.png',
    adaptiveIcon: {
      foregroundImage: './assets/images/logo.png',
      backgroundColor: '#ffffff',
    },
    notification: {
      icon: './assets/images/notification-icon.png',
      color: '#6200EE',
    },
  },

  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/logo.png',
  },

  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/logo.png',
        imageWidth: 170,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    'expo-font',
    [
      'expo-notifications',
      {
        icon: './assets/images/notification-icon.png',
        color: '#6200EE',
        sounds: ['./assets/sounds/notification.wav'],
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '0dca21b6-7a9a-4c7d-8da4-7f73d09c3b7e',
    },
  },
});
