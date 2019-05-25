<!-- markdownlint-disable MD009 -->

# ![Helio API Boilerplate](.github/logo.png) <!-- omit in toc -->

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

- [What is Helio API Boilerplate](#what-is-helio-api-boilerplate)
- [Get Started](#get-started)
- [Mods](#mods)
  - [Official Helio Mods](#official-helio-mods)
- [Build](#build)

---

## What is Helio API Boilerplate

Helio is an easily extensible backend utilizing Express.js, Mongoose, JWT, and User registration/authentication. It tries not to be too opinionated, but does conform to the [StandardJS](https://standardjs.com/) code style.

## Get Started

```sh
git clone --depth=1 https://github.com/mathiscode/helio-api-boilerplate.git
cd helio-api-boilerplate
cp .env.example .env # use the example environment
yarn # to install dependencies
yarn run server # for development
yarn start # for production
```

## Mods

Helio Mods are the easiest way to extend Helio and they remove the need to modify core routes.

You can find a mod template in [src/mods/example-mod/index.js](src/mods/example-mod/index.js)

You may either store your mods in the mods folder, or use a yarn/npm package.

To use a mod:

1. *Optional*: `yarn add <package>` (eg. helio-mod-jokes)
     - Or create your mod inside `src/mods`
2. Modify [src/index.js](src/index.js):
    - `import ModName from <package>` under the "Import mods" comment
    - Add an object to the Mods array under the "Set mods to load" comment:
      - `{ path: '/my-mod', module: ModName }`

### Official Helio Mods

[Helio Jokes](https://github.com/mathiscode/helio-mod-jokes) - [npm](https://www.npmjs.com/package/helio-mod-jokes)

- `yarn add helio-mod-jokes`
- `import Jokes from 'helio-mod-jokes'`
- `{ path: '/jokes', module: Jokes }`

## Build

Just run `yarn build` and your project will be built into `dist/`
