import { boot } from './src/lib/bootLog';

boot('index.ts start (before any other import)');

import { registerRootComponent } from 'expo';

boot('expo imported');

import App from './App';

boot('App module imported');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

boot('registerRootComponent called');
