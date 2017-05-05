/**
 * Created by yuanyuan on 17/3/19.
 */
//纯js文件,无需引入包
const exec = require('child_process').exec;

async function dump_all_mongo_data(mongo_port,mongo_host) {
    try{
        let timestamp = new Date().getTime();
        let month     = new Date(timestamp).getMonth() + 1;
        let day       = new Date(timestamp).getDate();
        if(!mongo_port) mongo_port = 27017;
        if(!mongo_host) mongo_host = '127.0.0.1';
        let path      = `/tmp/mongo_bck_${mongo_port}_${month}_${day}_${timestamp}`;

        let commend = `mongodump --host ${mongo_host} --port ${mongo_port} --out ${path}`;

        await execPromise(commend,{});

        return path;
    }catch (e){
        console.log(`dump_all_mongo_data error,e = ${e.message}...mongo_port = ${mongo_port}...mongo_host = ${mongo_host}`);
        throw e;
    }
}

async function clean_all_mongo_data(mongo_port,mongo_host) {
    try{
        if(!mongo_port) mongo_port = 27017;
        if(!mongo_host) mongo_host = '127.0.0.1';

        let commend = `mongo --host ${mongo_host} --port ${mongo_port} --eval "var dbs = db.getMongo().getDBNames();for(var i in dbs){db = db.getMongo().getDB(dbs[i]);if(db !== 'local' && db !== 'admin'){ print('drop db' +  db.getName());db.dropDatabase();}}"`;

        await execPromise(commend,{});

        return true;
    }catch (e){
        console.log(`clean_all_mongo_data error,e = ${e.message}...mongo_port = ${mongo_port}...mongo_host = ${mongo_host}`);
        throw e;
    }
}

const execPromise = (cmd,options)=>{
    return new Promise((resolve,reject)=>{
        exec(cmd,options,(err,stdout,stderr)=>{
            if (err){
                console.log(`${cmd}执行失败`);
                reject(err)
            }
            console.log(`${cmd} 执行`);
            resolve(stdout)
        })
    })
};

async function parse_args(args) {
    return new Promise((resolve,reject) => {
        if(Array.isArray(args) && args.length > 0){
            let port = null;
            let host = null;
            let commend = "";
            for(let i = 0;i < args.length;i++){
                switch (args[i]){
                    case '--port':
                        port = args[i+1];
                        i++;
                        break;
                    case '--host':
                        host = args[i+1];
                        i++;
                        break;
                    case 'dump':
                        commend = 'dump';
                        break;
                    case 'clean':
                        commend = 'clean';
                        break;
                    case 'only_clean':
                        commend = 'only_clean';
                        break;
                }
            }

            return resolve({host,port,commend});
        }else{
            return reject(`args param error`);
        }
    });
}

(async () => {
    try{
        let arguments = process.argv;

        let {host,port,commend} = await parse_args(arguments);
        let res = null;

        switch (commend){
            case 'dump':
                let path = await dump_all_mongo_data(port,host);
                res = `备份成功,备份路径为${path}`;
                break;
            case 'clean':
                await dump_all_mongo_data(port,host);
                await clean_all_mongo_data(port,host);
                res = `清除成功,如需回滚,请联系管理员`;
                break;
            case 'only_clean':
                await clean_all_mongo_data(port,host);
                res = `清除成功,不可恢复数据`;
                break;
            default:
                res = "请输入正确的指令";
                break;
        }

        console.log(res);
    }catch (e){
        console.error(`run comment fail,e = ${e.message}`);
    }
})();