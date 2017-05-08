/**
 * Created by yuanyuan on 17/5/7.
 */
const Koa                                                                   = require('koa');
const app                                                                   = new Koa();
const bodyParser                                                            = require('koa-bodyparser');
const Router                                                                = require('koa-router');
const router                                                                = new Router();
const mongodb                                                               = require('mongodb');
const mongoClient                                                           = mongodb.MongoClient;
const config                                                                = require('./env').config;
const mongo_option                                                          = require('./env').mongo_option;

app.use(bodyParser);



app.use(ctx => {
    ctx.body = 'Hello Koa';
});


app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);