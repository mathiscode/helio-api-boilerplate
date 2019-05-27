// Import mods
import ExampleMod from './mods/example-mod'
import BlogMod from './mods/blog-mod'
import UsersMod from 'helio-mod-users'
import JokesMod from 'helio-mod-jokes'

// Import models
import UserModel from './models/User'
import BlogPostModel from './models/BlogPost'
import TokenWhitelistModel from './models/TokenWhitelist'

export const Mods = [
  { path: '/example', module: ExampleMod },
  { path: '/user', module: UsersMod },
  { path: '/blog', module: BlogMod },
  { path: '/jokes', module: JokesMod }
]

// Set models to be provided to mods
export const ModModels = [
  { name: 'User', model: UserModel },
  { name: 'BlogPost', model: BlogPostModel },
  { name: 'TokenWhitelist', model: TokenWhitelistModel }
]
