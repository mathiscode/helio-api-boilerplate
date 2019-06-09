<!-- markdownlint-disable MD006 MD009 MD012 MD026 MD033 -->

# ![Helio API Boilerplate](.github/logo.png) <!-- omit in toc -->

Helio is an easily extensible backend utilizing Express.js, Mongoose, JWT, and User registration/authentication.

---

[![Version](https://img.shields.io/npm/v/helio-api-boilerplate.svg?color=blue)](https://www.npmjs.com/package/helio-api-boilerplate)
[![GitHub license](https://img.shields.io/github/license/mathiscode/helio-api-boilerplate.svg)](https://github.com/mathiscode/helio-api-boilerplate/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/mathiscode/helio-api-boilerplate.svg?branch=master)](https://travis-ci.org/mathiscode/helio-api-boilerplate)
[![Dependency Status](https://img.shields.io/david/mathiscode/helio-api-boilerplate.svg)](https://david-dm.org/mathiscode/helio-api-boilerplate)
[![Last Commit](https://img.shields.io/github/last-commit/mathiscode/helio-api-boilerplate.svg)](https://github.com/mathiscode/helio-api-boilerplate/commit/master)
[![GitHub issues](https://img.shields.io/github/issues/mathiscode/helio-api-boilerplate.svg)](https://github.com/mathiscode/helio-api-boilerplate/issues)
[![Standardjs](https://img.shields.io/badge/code_style-standard-blue.svg)](https://standardjs.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blue.svg)](https://github.com/mathiscode/helio-api-boilerplate/compare)
[![Hire Me](https://img.shields.io/badge/Hire%20Me-Please!-blue.svg)](https://www.linkedin.com/in/jrmathis/)
[![Beerpay](https://beerpay.io/mathiscode/helio-api-boilerplate/badge.svg?style=beer-square)](https://beerpay.io/mathiscode/helio-api-boilerplate)  [![Beerpay](https://beerpay.io/mathiscode/helio-api-boilerplate/make-wish.svg?style=flat-square)](https://beerpay.io/mathiscode/helio-api-boilerplate?focus=wish)

> “This is what I have learned, Malenfant. This is how it is, how it was, how it came to be.”
>  
> *― Stephen Baxter, Manifold: Time*

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Check%20out%20Helio%20Boilerplate&url=https://github.com/mathiscode/helio-api-boilerplate&hashtags=nodejs,javascript,developers,express,mongoose) *Help spread the word and share this project!*

---

- [Overview](#overview)
- [Important Notes](#important-notes)
- [Using as a boilerplate](#using-as-a-boilerplate)
- [Using from the command line](#using-from-the-command-line)
  - [Without installing](#without-installing)
  - [Installing globally](#installing-globally)
  - [Installing locally](#installing-locally)
  - [Specifying mods and models from the CLI](#specifying-mods-and-models-from-the-cli)
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
- [Is it perfect?](#is-it-perfect)

---

## Overview

Helio was created to address the scenario where you find yourself creating multiple projects that use Express.js/Mongoose and having to reinvent the wheel every time, implementing an authentication system, routers, etc.

Using Helio, you can quickly build new projects with a ready-to-deploy server.

It's designed to be flexible, so you can create a new project in these ways:

- [Using Helio as a boilerplate](#using-as-a-boilerplate)
  - Hack at the Helio code to build your project
- [Using Helio as a CLI tool](#using-from-the-command-line)
  - You can run `helio` from the command line to startup a new server
- [Using Helio as a module](#importing-as-a-module)
  - You can import Helio into any project and create a new server in just a few lines of code without adopting the conventions of using it as a boilerplate

## Important Notes

Most of the examples are using ES6 imports, so if you're not using Helio as a boilerplate, you'll need to setup your babel/webpack build environment or replace the import statements with:

`const Helio = require('helio-api-boilerplate').default`

`const SomeMod = require(<package>).default`

### There are two required options, and these can be set with: <!-- omit in toc -->

- Environment Variables
  - `DB_URI=[your MongoDB Connection URI]`
  - `JWT_SECRET=[a random string to sign user tokens]`
- Module Options
  - `new Helio({ dbUri: 'mongo-uri', jwtSecret: 'my-secret })`
- CLI Options
  - `helio --dbUri mongo-uri --jwtSecret my-secret`

### By default, a server will load the following mods: <!-- omit in toc -->

- `helio-mod-users`
- `helio-mod-jokes`
- `src/mods/example-mod`
- `src/mods/blog-mod`

### A bit about mods and models <!-- omit in toc -->

Mods are nothing more than objects with an [Express](https://expressjs.com/) router and some sugar. 

Models are just normal [Mongoose](https://mongoosejs.com/) models.

The mods will handle routes under a given /path. Models are not loaded directly by mods, but provided by Helio when the mod is instantiated with the `needModels` property, which is an array of models to be loaded when the mod is instantiated. The mod can then use its own schemas to extend the models provided by Helio.

If that's confusing, just look at the [example-mod](src/mods/example-mod/index.js) and you'll see what's going on.

## Using as a boilerplate

<details open>
<summary><strong>Click to collapse/expand</strong></summary>

You probably want to [use this repository as a template](https://help.github.com/en/articles/creating-a-repository-from-a-template), then replace the clone URL and directory name below.

```sh
git clone https://github.com/mathiscode/helio-api-boilerplate.git
cd helio-api-boilerplate
cp .env.example .env # use the example environment; modify as needed
yarn # to install dependencies; or npm install
yarn server # for development; or npm run server
yarn start # for production; or npm start
```

You'll want to start by exploring [src/config.js](src/config.js) and [src/index.js](src/index.js).

</details>

## Using from the command line

<details open>
<summary><strong>Click to collapse/expand</strong></summary>

Arguments that you don't pass to the CLI will use env variables or defaults.

### Without installing

```sh
npx helio-api-boilerplate --help
```

### Installing globally

```sh
yarn global add helio-api-boilerplate # or npm install -g helio-api-boilerplate
helio --help
```

### Installing locally

```sh
yarn add helio-api-boilerplate # or npm install helio-api-boilerplate
npx helio --help
```

### Specifying mods and models from the CLI

You can override the default mods and models with the `--mod` and `--model` arguments.

- Mod Syntax: `modRootPath:pathOrModule`
- Model Syntax: `modelName:pathOrModule`

If you want to use one of Helio's default models (eg. User, BlogPost, or TokenWhitelist), use the `Helio:ModelName` syntax.

Examples:

```sh
helio --mod /user:helio-mod-users --model Helio:User --model Helio:TokenWhitelist
```

```sh
helio --mod /myMod:/path/to/myMod --model MyModel:/path/to/MyModel
```

</details>

## Importing as a module

<details open>
<summary><strong>Click to collapse/expand</strong></summary>


```sh
yarn add helio-api-boilerplate helio-mod-users
```

```js
import Helio from 'helio-api-boilerplate'
import UsersMod from 'helio-mod-users'
import UsersModel from 'helio-api-boilerplate/src/models/User'
import TokenWhitelist from 'helio-api-boilerplate/src/models/TokenWhitelist'

const server = new Helio({
  // DB URI of a MongoDB instance
  dbUri: 'mongodb+srv://USER:PASS@HOST/myapp?retryWrites=true', // required or DB_URI env
  // Random string used to sign JWT tokens
  jwtSecret: 'supersecret123!', // required or JWT_SECRET env
  // Timeout for JWT tokens
  jwtTimeout: '1h',
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

</details>

## Mods

<details open>
<summary><strong>Click to collapse/expand</strong></summary>


Helio Mods are the easiest way to extend Helio and they remove the need to modify core routes.

**They're just classes, so don't feel overwhelmed.**

### Using packaged mods

1. `yarn add <package>` or `npm install <package>` (eg. helio-mod-jokes)
2. Boilerplate Method
   - Modify [src/config.js](src/config.js):
       - `import ModName from <package>` under the "Import mods" comment
       - Add an object to the Mods array under the "Set mods to load" comment:
         - `{ path: '/my-mod', module: ModName }`
3. CLI Method
   - `helio --mod /my-mod:<package>`
4. Module Method
   - `import ModName from <package>`
   - `new Helio({ mods: [{ path: '/my-mod', module: ModName }] })`

### Creating custom mods

1. Boilerplate Method
   - Create a folder for your mod in `src/mods` and create an `index.js`
   - Modify [src/config.js](src/config.js):
      - `import MyMod from './mods/my-mod'` under the "Import mods" comment
      - Add an object to the Mods array under the "Set mods to load" comment:
        - `{ path: '/my-mod', module: MyMod }`
2. CLI Method
   - `helio --mod /my-mod:./path/to/my-mod`
3. Module Method
   - `import MyMod from './path/to/my-mod'`
   - `new Helio({ mods: [{ path: '/my-mod', module: MyMod }] })`
4. For reference, see:
      - [src/mods/example-mod/index.js](src/mods/example-mod/index.js) for a fully commented example that uses all available features
      - [src/mods/minimal-mod/index.js](src/mods/minimal-mod/index.js) for a barebones starting point for a new mod
      - [src/mods/blog-mod/index.js](src/mods/blog-mod/index.js) for a functional real-world example


### Official Helio mods

  - [Helio Users](https://github.com/mathiscode/helio-mod-users) - [npm](https://www.npmjs.com/package/helio-mod-users)

    - `yarn add helio-mod-users` or `npm install helio-mod-users`
    - `import UsersMod from 'helio-mod-users'`
    - `{ path: '/user', module: UsersMod }`

  - [Helio Jokes](https://github.com/mathiscode/helio-mod-jokes) - [npm](https://www.npmjs.com/package/helio-mod-jokes)

    - `yarn add helio-mod-jokes` or `npm install helio-mod-jokes`
    - `import JokesMod from 'helio-mod-jokes'`
    - `{ path: '/jokes', module: JokesMod }`

</details>

## Deploying

<details open>
<summary><strong>Click to collapse/expand</strong></summary>

### Heroku

1. `heroku git:remote -a your-app-name`
2. `heroku plugins:install heroku-config`
3. `cp .env.heroku.example .env.heroku`
4. Modify `.env.heroku` as needed
5. `heroku config:push -f .env.heroku -a your-app-name`
6. `git push heroku master`

</details>

## Testing

<details open>
<summary><strong>Click to collapse/expand</strong></summary>

The normal testing process is handled with `yarn test`, which does the following:

- Runs the [standard](https://standardjs.com) linter against the codebase
- Runs [mocha](https://mochajs.org) - add new tests and modify [test/index.js](test/index.js) for your use case

If you don't want to enforce the standard code style, just remove `standard &&` from the package.json test script.

The more comprehensive testing during development happens with [Postman](https://www.getpostman.com/) collections and [newman](https://www.npmjs.com/package/newman). More documentation about that will come soon.

For now, if you're interested in using it, collections are found in [test/postman/collections](test/postman/collections) and while the development server is running (with `yarn server`), run `yarn test:mods`

</details>

## I don't like how Helio does [X]

In essence, this is a ready-to-deploy Express server, so if you're comfortable with Express you can easily modify any part of it to fit your needs. Please feel free to gut the code and just keep what makes your life easier! 😁

## Is it perfect?

![Really?](https://media.tenor.com/images/e3e3e0ff7312168a1b657874f42d509e/tenor.gif)
