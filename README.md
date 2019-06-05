<!-- markdownlint-disable MD006 MD009 MD033 -->

# ![Helio API Boilerplate](.github/logo.png) <!-- omit in toc -->

Helio is an easily extensible backend utilizing Express.js, Mongoose, JWT, and User registration/authentication.

---

[![GitHub license](https://img.shields.io/github/license/mathiscode/helio-api-boilerplate.svg)](https://github.com/mathiscode/helio-api-boilerplate/blob/master/LICENSE)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.org/mathiscode/helio-api-boilerplate.svg?branch=master)](https://travis-ci.org/mathiscode/helio-api-boilerplate)
[![GitHub issues](https://img.shields.io/github/issues/mathiscode/helio-api-boilerplate.svg)](https://github.com/mathiscode/helio-api-boilerplate/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/mathiscode/helio-api-boilerplate/compare)
[![Hire Me](https://img.shields.io/badge/Hire%20Me-Please!-blue.svg)](https://www.linkedin.com/in/jrmathis/)
[![Beerpay](https://beerpay.io/mathiscode/helio-api-boilerplate/badge.svg?style=beer-square)](https://beerpay.io/mathiscode/helio-api-boilerplate)  [![Beerpay](https://beerpay.io/mathiscode/helio-api-boilerplate/make-wish.svg?style=flat-square)](https://beerpay.io/mathiscode/helio-api-boilerplate?focus=wish)

> “Space is for the cephalopods, Maura. It never was meant for us.”
> 
> *- Stephen Baxter, Manifold: Time* 

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Check%20out%20Helio%20Boilerplate&url=https://github.com/mathiscode/helio-api-boilerplate&hashtags=nodejs,javascript,developers) *Help spread the word and share this project!*

---

- [Using as a boilerplate](#using-as-a-boilerplate)
- [Importing as a module](#importing-as-a-module)
  - [Properties](#properties)
  - [Methods](#methods)
- [Mods](#mods)
  - [Using packaged mods](#using-packaged-mods)
  - [Creating custom mods](#creating-custom-mods)
  - [Official Helio mods](#official-helio-mods)
- [Deploying](#deploying)
  - [Heroku](#heroku)
- [Testing](#testing)
- [I don't like how Helio does [X]](#i-dont-like-how-helio-does-x)

---

## Using as a boilerplate

You probably want to [fork this repository](https://github.com/mathiscode/helio-api-boilerplate/fork) first, rename the repo to suit your needs, then replace the clone URL below. 

```sh
git clone https://github.com/mathiscode/helio-api-boilerplate.git
cd helio-api-boilerplate
cp .env.example .env # use the example environment; modify as needed
yarn # to install dependencies; or npm install
yarn server # for development; or npm run server
yarn start # for production; or npm start
```

## Importing as a module

<detail>

<summary>Click to expand</summary>

```sh
yarn add helio-api-boilerplate helio-mod-users
```

```js
import Helio from 'helio-api-boilerplate'
import UsersMod from 'helio-mod-users'
import UsersModel from 'helio-api-boilerplate/models/User'
import TokenWhitelist from 'helio-api-boilerplate/models/TokenWhitelist'

const server = new Helio({
  // DB URI of a MongoDB instance
  dbUri: 'mongodb+srv://USER:PASS@HOST/myapp?retryWrites=true', // required
  // Random string used to sign JWT tokens
  jwtSecret: 'supersecret123!', // required
  // Port number for the server
  port: process.env.PORT || 3001,
  // Prevent automatically listening on port 
  noListen: false,
  // Log to DB
  logToDB: false,
  // Operational log output to console
  consoleLog: true,
  // Errors output to console
  consoleErrors: true,
  // Verbose output from mongoose operations
  mongooseDebug: false,

  // Mods that will be loaded
  // Do not include this option if you want to use the default mods
  //  (Users, Blog, Jokes, Example)
  mods: [
    { path: '/user', module: UsersMod }
  ],

  // Models that will be provided to mods
  // Do not include this option if you want to use the default models
  //  (Users, BlogPost, TokenWhitelist)
  models: [
    { name: 'Users', model: UsersModel },
    { name: 'TokenWhitelist', model: TokenWhitelistModel }
  ],

  // Custom middleware that will run before mods
  // May be simple functions (req, res, next) or Express modules
  middleware: [
    (req, res, next) => {
      console.log('Hello from custom middleware')
      return next()
    }
  ]
})
```

On the `server` object, you can access the following properties and methods:

### Properties

  - `app`: the Express app object
  - `options`: the options that were used to create the Helio server

### Methods

  - `listen()`: start Helio listening for requests - **only useful if using noListen**

</detail>

## Mods

Helio Mods are the easiest way to extend Helio and they remove the need to modify core routes.

**They're just classes, so don't feel overwhelmed.**

### Using packaged mods

1. `yarn add <package>` or `npm install <package>` (eg. helio-mod-jokes)
2. Modify [src/config.js](src/config.js):
    - `import ModName from <package>` under the "Import mods" comment
    - Add an object to the Mods array under the "Set mods to load" comment:
      - `{ path: '/my-mod', module: ModName }`

### Creating custom mods

1. Create a folder for your mod in `src/mods` and create an `index.js`
2. For reference, see:
      - [src/mods/example-mod/index.js](src/mods/example-mod/index.js) for a fully commented example that uses all available features
      - [src/mods/minimal-mod/index.js](src/mods/minimal-mod/index.js) for a barebones starting point for a new mod
      - [src/mods/blog-mod/index.js](src/mods/blog-mod/index.js) for a functional real-world example
3. Modify [src/config.js](src/config.js):
      - `import MyMod from './mods/my-mod'` under the "Import mods" comment
      - Add an object to the Mods array under the "Set mods to load" comment:
        - `{ path: '/my-mod', module: MyMod }`

### Official Helio mods

  - [Helio Users](https://github.com/mathiscode/helio-mod-users) - [npm](https://www.npmjs.com/package/helio-mod-users)

    - `yarn add helio-mod-users` or `npm install helio-mod-users`
    - `import UsersMod from 'helio-mod-users'`
    - `{ path: '/user', module: UsersMod }`

  - [Helio Jokes](https://github.com/mathiscode/helio-mod-jokes) - [npm](https://www.npmjs.com/package/helio-mod-jokes)

    - `yarn add helio-mod-jokes` or `npm install helio-mod-jokes`
    - `import JokesMod from 'helio-mod-jokes'`
    - `{ path: '/jokes', module: JokesMod }`

## Deploying

### Heroku

1. `heroku git:remote -a your-app-name`
2. `heroku plugins:install heroku-config`
3. `cp .env.heroku.example .env.heroku`
4. Modify `.env.heroku` as needed
5. `heroku config:push -f .env.heroku -a your-app-name`
6. `git push heroku master`

## Testing

The normal testing process is handled with `yarn test`, which does the following:

- Runs the [standard](https://standardjs.com) linter against the codebase
- Runs [mocha](https://mochajs.org) - add new tests and modify [test/index.js](test/index.js) for your use case

If you don't want to enforce the standard code style, just remove `standard &&` from the package.json test script.

The more comprehensive testing during development happens with [Postman](https://www.getpostman.com/) collections and [newman](https://www.npmjs.com/package/newman). More documentation about that will come soon.

For now, if you're interested in using it, collections are found in [test/postman/collections](test/postman/collections) and while the development server is running (with `yarn server`), run `yarn test:mods`

## I don't like how Helio does [X]

In essence, this is a ready-to-deploy Express server, so if you're comfortable with Express you can easily modify any part of it to fit your needs. Please feel free to gut the code and just keep what makes your life easier! 😁
