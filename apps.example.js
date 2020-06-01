/*
* apps.js
* Helio App Config
*
* This file tells Helio which apps to load, along with their associated options.
*
* Helio expects this to return, as the default export, an object containing
* a property of "apps", which is an array of App Objects.
*
* An App Object looks like this:
*
* {
*   use: 'my-helio-app', // must be a string or class; if string, either the name of an npm module, or a path which would resolve when it is loaded via require
*   options: { // you may include any custom values or functions in the options property for your app to consume
*     name: 'My App Name',
*     root: '/path/to/app',
*     custom: { data: 101 }
*   }
* }
*/

// You can define Apps directly inside apps.js as well.
// An app is essentially just a class that is provided an Express router
const minimalistApp = class {
  constructor (router, logger, mongoose, options) {
    this.name = 'Helio Minimalist App' // The name of your app used throughout the system
    this.root = '/apps/minimalist-app' // The path at which your app is accessible

    router.get('/', (req, res, next) => {
      // The logger is the global Winston instance
      logger.silly('Minimalist app is being called!')
      res.send("I'm minimal!")
    })
  }
}

module.exports = {
  apps: [
    { use: 'helio-app-authentication' },
    { use: 'helio-app-react-template' },
    { use: minimalistApp }
  ]
}
