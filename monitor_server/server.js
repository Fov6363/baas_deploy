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
const mongo_url                                                             = require('./env').mongo_url;
const SystemLogRouter                                                       = require('./routers/system_log');

let conn;

app.use(bodyParser());


router.post('/system_log/new.json',SystemLogRouter.insert);


router.get('/',function (ctx,next) {
    ctx.body = 'hello world';
});

app.use(router.routes());
app.use(router.allowedMethods());


mongoClient.connect(mongo_url,mongo_option,function (err,_conn) {
    conn = _conn;

    console.log(`server has running in port ${config.server_port}`);
    app.listen(config.server_port);
});

