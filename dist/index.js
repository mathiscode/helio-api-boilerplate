!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Helio=t():e.Helio=t()}(global,function(){return function(e){var t={};function s(o){if(t[o])return t[o].exports;var n=t[o]={i:o,l:!1,exports:{}};return e[o].call(n.exports,n,n.exports,s),n.l=!0,n.exports}return s.m=e,s.c=t,s.d=function(e,t,o){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},s.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(s.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)s.d(o,n,function(t){return e[t]}.bind(null,n));return o},s.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="",s(s.s=12)}([function(e,t){e.exports=require("mongoose")},function(e,t){e.exports=require("express")},function(e,t){e.exports=require("winston")},function(e,t){e.exports=require("express-jwt")},function(e,t){e.exports=require("body-parser")},function(e,t){e.exports=require("express-rate-limit")},function(e,t){e.exports=require("winston-mongodb")},function(e,t){e.exports=require("uuid")},function(e,t){e.exports=require("helio-mod-users")},function(e,t){e.exports=require("helio-mod-jokes")},function(e,t){e.exports=require("bcryptjs")},function(e,t){e.exports=require("@babel/polyfill")},function(e,t,s){"use strict";s.r(t);s(11);var o=s(1),n=s.n(o),r=s(4),i=s.n(r),a=s(0),d=s.n(a),l=s(3),u=s.n(l),c=s(2),p=s.n(c),h=s(5),m=s.n(h),f=s(6),g=s(7),b=s(8),E=s.n(b),y=s(9),S=s.n(y),O=s(10),_=s.n(O);const v=d.a.Schema({id:{type:String,index:!0,unique:!0},username:{type:String,index:!0,unique:!0},email:{type:String,index:!0,unique:!0},password:String,roles:[{type:String}],flags:{confirmed:{type:Boolean,default:!1}},profile:{name:String},settings:{},clientSettings:{},serverSettings:{}},{timestamps:!0});v.methods.validPassword=function(e){return _.a.compareSync(e,this.password)};var w=d.a.model("User",v);const x=d.a.Schema({id:{type:String,index:!0,unique:!0}},{timestamps:!0});var P=d.a.model("BlogPost",x);const I=d.a.Schema({token:{type:String,required:!0,unique:!0}},{timestamps:!0});I.index({createdAt:1},{expires:process.env.JWT_TIMEOUT||"1h"});var T=d.a.model("TokenWhitelist",I);const M=[{path:"/example",module:class{constructor(e){this.options=e,this.name=e.name||"Example Helio Mod";const t=this.router=n.a.Router(e.routerOptions);this.publicPaths=[e.path,new RegExp(`^${e.path}/.*`)],this.needModels=["User"],this.subSchemas={User:new d.a.Schema({myData:{field1:String,field2:{type:Number,required:!0},field3:{type:Date,default:Date.now},field4:Boolean,field5:[{type:String,default:"Field5 Data"}]}})},t.get("/",this.index.bind(this)),t.get("/add/:x/:y",this.add),t.get("/test-error",this.testError);const s=this;t.use((e,t,o,n)=>(t.Log.error(`[MOD ERROR] (${s.name}) ${e.stack}`),o.status(500).json({error:e.toString()})))}receiveModels(e){this.models={},this.subModels={},e.forEach(e=>{this.models[e.name]=e.model});for(const e in this.subSchemas){const t=this.models[e],s=this.subSchemas[e];this.subModels[e]=t.discriminator(this.name,s)}}index(e,t,s){const{user:o}=e;t.json({mod:this.name,user:o})}add(e,t,s){let{x:o,y:n}=e.params;o=parseFloat(o),n=parseFloat(n),t.json(o+n)}testError(e,t,s){s(new Error("Intentional Error"))}}},{path:"/user",module:E.a},{path:"/blog",module:class{constructor(e){this.options=e,this.name=e.name||"Helio Blog Mod";const t=this.router=n.a.Router(e.routerOptions);this.needModels=["BlogPost"],this.subSchemas={BlogPost:new d.a.Schema({owner:String,public:{type:Boolean,default:!0},title:{type:String,required:!0},excerpt:String,content:{type:String,required:!0}})},this.subSchemas.BlogPost.options.toJSON={transform:(e,t,s)=>(delete t._id,delete t.__v,delete t.__t,t)},t.get("/",this.getAllMyPosts.bind(this)),t.post("/",this.addPost.bind(this)),t.get("/:id",this.getPost.bind(this)),t.patch("/:id",this.updatePost.bind(this)),t.delete("/:id",this.deletePost.bind(this));const s=this;t.use((e,t,o,n)=>(t.Log.error(`[MOD ERROR] (${s.name}) ${e.stack}`),o.status(500).json({error:e.toString()})))}receiveModels(e){this.models={},this.subModels={},e.forEach(e=>{this.models[e.name]=e.model});for(const e in this.subSchemas){const t=this.models[e],s=this.subSchemas[e];this.subModels[e]=t.discriminator(this.name,s)}}async getAllMyPosts(e,t,s){try{const o=await this.subModels.BlogPost.find({owner:e.user.id}).sort({createdAt:"desc"});t.json(o)}catch(e){s(e)}}async addPost(e,t,s){try{const o=new this.subModels.BlogPost({id:Object(g.v4)(),owner:e.user.id,public:e.body.public||!0,title:e.body.title||"Untitled Blog Post",excerpt:e.body.excerpt?e.body.excerpt.substring(0,256):e.body.content.length>256?e.body.content.substring(0,256)+"...":null,content:e.body.content});await o.save(),t.json(o)}catch(e){s(e)}}async getPost(e,t,s){try{const o=await this.subModels.BlogPost.findOne({id:e.params.id,$or:[{owner:e.user.id},{public:!0}]});if(!o)return t.status(404).json({error:"Post not found"});t.json(o)}catch(e){s(e)}}async updatePost(e,t,s){try{const o=await this.subModels.BlogPost.findOneAndUpdate({id:e.params.id,owner:e.user.id},{...e.body},{new:!0});t.json(o)}catch(e){s(e)}}async deletePost(e,t,s){try{const o=await this.subModels.BlogPost.findOneAndRemove({id:e.params.id,owner:e.user.id});t.json(o)}catch(e){s(e)}}}},{path:"/jokes",module:S.a}],R=[{name:"User",model:w},{name:"BlogPost",model:P},{name:"TokenWhitelist",model:T}];s.d(t,"DefaultModels",function(){return L});const L=[{name:"User",model:w},{name:"BlogPost",model:P},{name:"TokenWhitelist",model:T}];let j=["/",...process.env.PUBLIC_PATHS?process.env.PUBLIC_PATHS.split(","):[]];t.default=class{constructor(e){(e=this.options=e||{}).middleware="function"==typeof e.middleware?[e.middleware]:e.middleware,e.middleware=Array.isArray(e.middleware)?e.middleware:[],this.mods=e.mods||M,this.models=e.models||R,this.routes=[];const t=this.app=n()();t.set("HELIO_DB_URI",e.dbUri||process.env.DB_URI),t.set("HELIO_JWT_SECRET",e.jwtSecret||process.env.JWT_SECRET),t.set("HELIO_JWT_TIMEOUT",e.jwtTimeout||process.env.JWT_TIMEOUT||"1h"),t.set("HELIO_LOG_TO_DB",e.logToDB||"true"===process.env.LOG_TO_DB),t.set("HELIO_CONSOLE_LOG",e.consoleLog||"true"===process.env.CONSOLE_LOG),t.set("HELIO_CONSOLE_ERRORS",e.consoleErrors||"true"===process.env.CONSOLE_ERRORS),d.a.set("useNewUrlParser",!0),d.a.set("useFindAndModify",!1),d.a.set("useCreateIndex",!0),d.a.set("debug",e.mongooseDebug||!1);let s=!1;if(t.get("HELIO_DB_URI")||(s="You must pass dbUri option or have DB_URI environment variable"),t.get("HELIO_JWT_SECRET")||(s="You must pass jwtSecret option or have JWT_SECRET environment variable"),s)throw new Error(s);const o=e.logTransports||[];t.get("HELIO_LOG_TO_DB")&&o.push(new f.MongoDB({db:t.get("HELIO_DB_URI")})),o.push(new p.a.transports.Console({format:p.a.format.simple(),silent:!t.get("HELIO_CONSOLE_LOG")})),this.log=p.a.createLogger({format:p.a.format.json(),transports:o}),this.connectDB(),this.initializeServer()}connectDB(){this.log.info("Connecting to database..."),d.a.connect(this.app.get("HELIO_DB_URI"),e=>{if(e)throw this.log.error(e.toString()),e})}initializeServer(){const e=this.app,t=this.options;e.disable("x-powered-by"),e.use(i.a.json());const s=m()({windowMs:process.env.RATE_LIMIT_WINDOW||9e5,max:process.env.RATE_LIMIT_MAX_REQUESTS_PER_WINDOW||100,skip:(e,t)=>"127.0.0.1"===e.ip||"::1"===e.ip});e.use(s),e.use((e,t,s)=>{e.Log=this.log,s()}),t.middleware.forEach(t=>e.use(t)),this.mods.forEach(e=>{let t=new(0,e.module)(e);const s=t.publicPaths||[];j=[...j,...s],t=null}),e.use(u()({secret:e.get("HELIO_JWT_SECRET"),credentialsRequired:!1})),e.use(u()({secret:e.get("HELIO_JWT_SECRET"),isRevoked:async(e,t,s)=>s(null,!await T.countDocuments({token:e.headers.authorization.replace("Bearer ","")}))}).unless({path:j})),this.mods.forEach(t=>{const s=new(0,t.module)(t);if(s.receiveModels&&s.needModels){const e=R.filter(e=>s.needModels.includes(e.name));s.receiveModels(e)}e.use(t.path,s.router),this.log.info(`[MOD REGISTERED] ${s.name}`)}),e.get("/",(e,s)=>{s.json({name:t.name||process.env.NAME||"Helio API Server"})}),this.routes.forEach(t=>{e.use(t.path,t.module)}),e.use((e,t,s)=>{t.status(404).json({error:"Invalid API method"})}),e.use((e,s,o,n)=>(t.consoleErrors&&"UnauthorizedError"!==e.name&&this.log.error("APP ERROR:",e.stack),"UnauthorizedError"===e.name?o.status(401).json({error:"Invalid token"}):o.status(500).json({error:"Internal API error"}))),t.noListen||this.listen()}listen(){const e=this.options.port||process.env.PORT||3001;this.app.listen(e),this.log.info(`${this.options.name||process.env.NAME||"Helio API Server"} listening on port ${e}`)}}}])});