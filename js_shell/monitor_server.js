/**
 * Created by yuanyuan on 17/5/5.
 */
const exec          = require('child_process').exec;
const os            = require('os');
const Promise       = require('bluebird');

const CPU_WARNING_VALUE    = '95%';
const MEMORY_WARNING_VALUE = '95%';
const STORAGE_WARING_VALUE = '95%';

const EXEC_TIMEOUT = 10000;//5s

async function get_server_ip() {
    //从多个curl中获取结果,只要能获取到一个就行
    const curl_1 = `curl ipecho.net/plain; echo`;
    const curl_2 = `wget http://ipecho.net/plain -O - -q ; echo`;

    const promise_map = [run_command(curl_1),run_command(curl_2)];

    await Promise.all(promise_map)
            .then(result => {
                console.log(result);
            })
            .catch(e => {
                console.log(`e = ${e.message}`);
                throw e;
            })
}

function handle_curl_result(result) {
    if(!Array.isArray(result)){
        throw new Error(`result is not array`);
    }

    let ip = '';

    result.map(item => {
        if(typeof item === 'string'){

        }
    })
}

async function get_cpu() {
    const cpus = os.cpus();
    const doc = [];
    let count_use = 0;
    for(let i = 0;i < cpus.length;i++){
        const times = cpus[i]['times'];
        const use = ((1 - (times.idle / (times.user + times.nice + times.sys + times.idle + times.irq))) * 100).toFixed(2);
        doc.push({
            'name': `cpu${i}`,use: use + '%'
        });
        count_use += parseFloat(use);
    }

    const total_use = (count_use / cpus.length).toFixed(2);

    doc.push({
        'name': 'total',
        'use' : total_use + '%'
    });

    return doc;
}

async function get_memory() {
    const freemem = bytes2mb(os.freemem()) + 'MB';
    const totalmem = bytes2mb(os.totalmem()) + 'MB';

    return {freemem,totalmem};
}

async function get_storage() {
    try{
        let str = await run_command(`df -k`);

        parse_df_h_result(str);

    }catch(e){
        console.log(e);
    }
}

//小于1个G的磁盘不显示
function parse_df_h_result(str) {
    const lines = str.trim().split('\n');
    const result_arr = [];
    lines.shift();

    lines.forEach(line => {
        line = line.replace(/[\s\n\r\t\b]+/g,' ').split(' ');
        const disk      = line[0];
        const size      = k2Gb(line[1]);
        const used      = k2Gb(line[2]);
        const avail     = k2Gb(line[3]);
        const mount     = line.pop();
        if(size > 1){
            result_arr.push({
                size: size + 'G',used: used + 'G',avail:avail + 'G',mount,disk
            });
        }

    });

    return result_arr;
}

function k2Gb(size) {
    return (size / (1024 * 1024)).toFixed(1);
}

function run_command(command) {
    return new Promise(function (resolve,reject) {
        exec(command,{'timeout':EXEC_TIMEOUT},function (err,stdout,stderr) {
            if(err){
                return reject(err);
            }else{
                return resolve(stdout);
            }
        })
    });
}

function bytes2mb(number) {
    if(isNaN(number)){
        return 0;
    }else{
        return (number / (1024 * 1024)).toFixed(2);
    }
}

// get_cpu();
// get_memory();
get_server_ip('df -h');