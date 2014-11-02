App.info({
  name: 'Meteorgram',
  description: 'A photo sharing app made in Meteor.',
  author: 'Meteor Vegas',
  website: 'http://vegas.meteor.com',
  version: '0.0.1'
});

App.icons({
  'iphone': 'resources/icons/icon-60x60.png',
  'iphone_2x': 'resources/icons/icon-60x60@2x.png'
});

App.launchScreens({
  'iphone': 'resources/splash/splash-320x480.png',
  'iphone5': 'resources/splash/splash-320x568@2x.png'
});

App.setPreference('StatusBarOverlaysWebView', false);
App.setPreference('StatusBarBackgroundColor', '#596595');
