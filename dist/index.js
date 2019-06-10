!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Helio=t():e.Helio=t()}(global,function(){return function(e){var t={};function s(o){if(t[o])return t[o].exports;var n=t[o]={i:o,l:!1,exports:{}};return e[o].call(n.exports,n,n.exports,s),n.l=!0,n.exports}return s.m=e,s.c=t,s.d=function(e,t,o){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(s.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)s.d(o,n,function(t){return e[t]}.bind(null,n));return o},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="",s(s.s=13)}([function(e,t){e.exports=require("mongoose")},function(e,t){e.exports=require("express")},function(e,t){e.exports=require("winston")},function(e,t){e.exports=require("express-jwt")},function(e,t){e.exports=require("body-parser")},function(e,t){e.exports=require("express-rate-limit")},function(e,t){e.exports=require("winston-mongodb")},function(e){e.exports={name:"helio-api-boilerplate",version:"0.6.3",description:"Extensible backend boilerplate utilizing Express.js, Mongoose, JWT, and User registration/authentication",author:"J.R. Mathis (https://github.com/mathiscode)",license:"MIT",homepage:"https://github.com/mathiscode/helio-api-boilerplate#readme",keywords:["nodejs","express","jwt","mongoose","mongodb","boilerplate","api-server"],main:"dist/index.js",bin:{helio:"./dist/bin/helio"},scripts:{start:"npm run server:prod",server:"cross-env NODE_ENVIRONMENT=development nodemon --exec babel-node --require node_modules/dotenv/config src/bin/helio","server:prod":"cross-env NODE_ENVIRONMENT=production node dist/bin/helio",clean:"rimraf dist",transpile:"webpack",build:"cross-env NODE_ENV=production npm-run-all clean transpile build:mods","build:mods":"babel src/mods --out-dir dist/mods",test:"standard && cross-env NODE_ENV=testing PORT=0 mocha --require @babel/register --require dotenv/config --exit","test:mods":"npm-run-all test:mods:users test:mods:blog","test:mods:users":"newman run -e test/postman/postman_environment.json test/postman/collections/UsersMod.json","test:mods:blog":"newman run -e test/postman/postman_environment.json test/postman/collections/BlogMod.json","test:mods:staging":"npm-run-all test:mods:staging:users test:mods:staging:blog","test:mods:staging:users":"newman run -e test/postman/postman_environment_staging.json test/postman/collections/UsersMod.json","test:mods:staging:blog":"newman run -e test/postman/postman_environment_staging.json test/postman/collections/BlogMod.json","test:mods:prod":"npm-run-all test:mods:prod:users test:mods:prod:blog","test:mods:prod:users":"newman run -e test/postman/postman_environment_prod.json test/postman/collections/UsersMod.json","test:mods:prod:blog":"newman run -e test/postman/postman_environment_prod.json test/postman/collections/BlogMod.json",commit:"commit-wizard"},repository:{type:"git",url:"git+https://github.com/mathiscode/helio-api-boilerplate.git"},bugs:{url:"https://github.com/mathiscode/helio-api-boilerplate/issues"},engines:{node:">=11.6.0"},standard:{ignore:["/dist"]},dependencies:{"@babel/polyfill":"^7.4.4",bcryptjs:"^2.4.3","body-parser":"^1.19.0",commander:"^2.20.0","cross-env":"^5.2.0",dotenv:"^8.0.0",express:"^4.16.4","express-jwt":"^5.3.1","express-rate-limit":"^4.0.1","helio-mod-jokes":"^1.0.0","helio-mod-users":"^1.1.1",jsonwebtoken:"^8.5.1",mongoose:"^5.5.4","npm-run-all":"^4.1.5",rimraf:"^2.6.3",uuid:"^3.3.2",winston:"^3.2.1","winston-mongodb":"^5.0.0"},devDependencies:{"@babel/cli":"^7.4.4","@babel/core":"^7.4.4","@babel/node":"^7.2.2","@babel/preset-env":"^7.4.4","@babel/register":"^7.4.4","babel-loader":"^8.0.6",chai:"^4.2.0","chai-http":"^4.3.0","clean-webpack-plugin":"^2.0.2","copy-webpack-plugin":"^5.0.3","create-file-webpack":"^1.0.2",eslint:"^5.16.0","eslint-config-standard":"^12.0.0","eslint-plugin-import":"^2.17.2","eslint-plugin-node":"^9.1.0","eslint-plugin-promise":"^4.1.1","eslint-plugin-standard":"^4.0.0",mocha:"^6.1.4",newman:"^4.5.0",nodemon:"^1.18.11","pre-git":"^3.17.1",standard:"^12.0.1",webpack:"^4.32.2","webpack-cli":"^3.3.2","webpack-node-externals":"^1.7.2"},release:{analyzeCommits:"simple-commit-message"},config:{"pre-git":{"pre-commit":["npm run build","npm test","git add ."]}}}},function(e,t){e.exports=require("uuid")},function(e,t){e.exports=require("helio-mod-users")},function(e,t){e.exports=require("helio-mod-jokes")},function(e,t){e.exports=require("bcryptjs")},function(e,t){e.exports=require("@babel/polyfill")},function(e,t,s){"use strict";s.r(t);s(12);var o=s(1),n=s.n(o),r=s(4),i=s.n(r),a=s(0),d=s.n(a),l=s(3),c=s.n(l),u=s(2),p=s.n(u),m=s(5),h=s.n(m),g=s(6),b=s(7),f=s(8),E=s(9),_=s.n(E),v=s(10),y=s.n(v),O=s(11),w=s.n(O);const S=d.a.Schema({id:{type:String,index:!0,unique:!0},username:{type:String,index:!0,unique:!0},email:{type:String,index:!0,unique:!0},password:String,roles:[{type:String}],flags:{confirmed:{type:Boolean,default:!1}},profile:{name:String},settings:{},clientSettings:{},serverSettings:{}},{timestamps:!0});S.methods.validPassword=function(e){return w.a.compareSync(e,this.password)};var x=d.a.model("User",S);const j=d.a.Schema({id:{type:String,index:!0,unique:!0}},{timestamps:!0});var M=d.a.model("BlogPost",j);const T=d.a.Schema({token:{type:String,required:!0,unique:!0}},{timestamps:!0});T.index({createdAt:1},{expires:process.env.JWT_TIMEOUT||"1h"});var I=d.a.model("TokenWhitelist",T);const P=[{path:"/example",module:class{constructor(e){this.options=e,this.name=e.name||"Example Helio Mod";const t=this.router=n.a.Router(e.routerOptions);this.publicPaths=[e.path,new RegExp(`^${e.path}/.*`)],this.needModels=["User"],this.subSchemas={User:new d.a.Schema({myData:{field1:String,field2:{type:Number,required:!0},field3:{type:Date,default:Date.now},field4:Boolean,field5:[{type:String,default:"Field5 Data"}]}})},t.get("/",this.index.bind(this)),t.get("/add/:x/:y",this.add),t.get("/test-error",this.testError);const s=this;t.use((e,t,o,n)=>(t.Log.error(`[MOD ERROR] (${s.name}) ${e.stack}`),o.status(500).json({error:e.toString()})))}receiveModels(e){this.models={},this.subModels={},e.forEach(e=>{this.models[e.name]=e.model});for(const e in this.subSchemas){const t=this.models[e],s=this.subSchemas[e];this.subModels[e]=t.discriminator(this.name,s)}}index(e,t,s){const{user:o}=e;t.json({mod:this.name,user:o})}add(e,t,s){let{x:o,y:n}=e.params;o=parseFloat(o),n=parseFloat(n),t.json(o+n)}testError(e,t,s){s(new Error("Intentional Error"))}}},{path:"/user",module:_.a},{path:"/blog",module:class{constructor(e){this.options=e,this.name=e.name||"Helio Blog Mod";const t=this.router=n.a.Router(e.routerOptions);this.needModels=["BlogPost"],this.subSchemas={BlogPost:new d.a.Schema({owner:String,public:{type:Boolean,default:!0},title:{type:String,required:!0},excerpt:String,content:{type:String,required:!0}})},this.subSchemas.BlogPost.options.toJSON={transform:(e,t,s)=>(delete t._id,delete t.__v,delete t.__t,t)},t.get("/",this.getAllMyPosts.bind(this)),t.post("/",this.addPost.bind(this)),t.get("/:id",this.getPost.bind(this)),t.patch("/:id",this.updatePost.bind(this)),t.delete("/:id",this.deletePost.bind(this));const s=this;t.use((e,t,o,n)=>(t.Log.error(`[MOD ERROR] (${s.name}) ${e.stack}`),o.status(500).json({error:e.toString()})))}receiveModels(e){this.models={},this.subModels={},e.forEach(e=>{this.models[e.name]=e.model});for(const e in this.subSchemas){const t=this.models[e],s=this.subSchemas[e];this.subModels[e]=t.discriminator(this.name,s)}}async getAllMyPosts(e,t,s){try{const o=await this.subModels.BlogPost.find({owner:e.user.id}).sort({createdAt:"desc"});t.json(o)}catch(e){s(e)}}async addPost(e,t,s){try{const o=new this.subModels.BlogPost({id:Object(f.v4)(),owner:e.user.id,public:e.body.public||!0,title:e.body.title||"Untitled Blog Post",excerpt:e.body.excerpt?e.body.excerpt.substring(0,256):e.body.content.length>256?e.body.content.substring(0,256)+"...":null,content:e.body.content});await o.save(),t.json(o)}catch(e){s(e)}}async getPost(e,t,s){try{const o=await this.subModels.BlogPost.findOne({id:e.params.id,$or:[{owner:e.user.id},{public:!0}]});if(!o)return t.status(404).json({error:"Post not found"});t.json(o)}catch(e){s(e)}}async updatePost(e,t,s){try{const o=await this.subModels.BlogPost.findOneAndUpdate({id:e.params.id,owner:e.user.id},{...e.body},{new:!0});t.json(o)}catch(e){s(e)}}async deletePost(e,t,s){try{const o=await this.subModels.BlogPost.findOneAndRemove({id:e.params.id,owner:e.user.id});t.json(o)}catch(e){s(e)}}}},{path:"/jokes",module:y.a}],R=[{name:"User",model:x},{name:"BlogPost",model:M},{name:"TokenWhitelist",model:I}];s.d(t,"DefaultModels",function(){return B});const B=[{name:"User",model:x},{name:"BlogPost",model:M},{name:"TokenWhitelist",model:I}];let L=["/",...process.env.PUBLIC_PATHS?process.env.PUBLIC_PATHS.split(","):[]];t.default=class{constructor(e){(e=this.options=e||{}).middleware="function"==typeof e.middleware?[e.middleware]:e.middleware,e.middleware=Array.isArray(e.middleware)?e.middleware:[],this.mods=e.mods||P,this.models=e.models||R,this.routes=[];const t=this.app=n()();t.set("HELIO_DB_URI",e.dbUri||process.env.DB_URI),t.set("HELIO_JWT_SECRET",e.jwtSecret||process.env.JWT_SECRET),t.set("HELIO_JWT_TIMEOUT",e.jwtTimeout||process.env.JWT_TIMEOUT||"1h"),t.set("HELIO_LOG_TO_DB",e.logToDB||"true"===process.env.LOG_TO_DB),t.set("HELIO_CONSOLE_LOG",e.consoleLog||"true"===process.env.CONSOLE_LOG),t.set("HELIO_CONSOLE_ERRORS",e.consoleErrors||"true"===process.env.CONSOLE_ERRORS),d.a.set("useNewUrlParser",!0),d.a.set("useFindAndModify",!1),d.a.set("useCreateIndex",!0),d.a.set("debug",e.mongooseDebug||!1);let s=!1;if(t.get("HELIO_DB_URI")||(s="You must pass dbUri option or have DB_URI environment variable"),t.get("HELIO_JWT_SECRET")||(s="You must pass jwtSecret option or have JWT_SECRET environment variable"),s)throw new Error(s);const o=e.logTransports||[];t.get("HELIO_LOG_TO_DB")&&o.push(new g.MongoDB({db:t.get("HELIO_DB_URI")})),o.push(new p.a.transports.Console({format:p.a.format.simple(),silent:!t.get("HELIO_CONSOLE_LOG")})),this.log=p.a.createLogger({format:p.a.format.json(),transports:o}),this.connectDB(),this.initializeServer()}connectDB(){this.log.info("Connecting to database..."),d.a.connect(this.app.get("HELIO_DB_URI"),e=>{if(e)throw this.log.error(e.toString()),e})}initializeServer(){const e=this.app,t=this.options;e.disable("x-powered-by"),e.use(i.a.json());const s=h()({windowMs:process.env.RATE_LIMIT_WINDOW||9e5,max:process.env.RATE_LIMIT_MAX_REQUESTS_PER_WINDOW||100,skip:(e,t)=>"127.0.0.1"===e.ip||"::1"===e.ip});e.use(s),e.use((e,t,s)=>{e.Log=this.log,s()}),t.middleware.forEach(t=>e.use(t)),this.mods.forEach(e=>{let t=new(0,e.module)(e);const s=t.publicPaths||[];L=[...L,...s],t=null}),e.use(c()({secret:e.get("HELIO_JWT_SECRET"),credentialsRequired:!1})),e.use(c()({secret:e.get("HELIO_JWT_SECRET"),isRevoked:async(e,t,s)=>s(null,!await I.countDocuments({token:e.headers.authorization.replace("Bearer ","")}))}).unless({path:L})),this.mods.forEach(t=>{const s=new(0,t.module)(t);if(s.receiveModels&&s.needModels){const e=R.filter(e=>s.needModels.includes(e.name));s.receiveModels(e)}e.use(t.path,s.router),this.log.info(`[MOD REGISTERED] ${s.name}`)}),e.get("/",(e,s)=>{s.json({name:t.name||process.env.NAME||"Helio API Server",version:process.env.SHOW_VERSION?b.version:null})}),this.routes.forEach(t=>{e.use(t.path,t.module)}),e.use((e,t,s)=>{t.status(404).json({error:"Invalid API method"})}),e.use((e,s,o,n)=>(t.consoleErrors&&"UnauthorizedError"!==e.name&&this.log.error("APP ERROR:",e.stack),"UnauthorizedError"===e.name?o.status(401).json({error:"Invalid token"}):o.status(500).json({error:"Internal API error"}))),t.noListen||this.listen()}listen(e){const t=this.options.port||process.env.PORT||3001,s=this.app.listen(t,()=>{this.port=s.address().port,this.log.info(`${this.options.name||process.env.NAME||"Helio API Server"} listening on port ${this.port}`),"function"==typeof e&&e(s)})}}}])});