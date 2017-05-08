/**
 * Created by yuanyuan on 17/5/5.
 */

const request = require('request');

const url = 'http://101.200.205.189:8091/ylyw/send_sms.json';
const mobile = 18247184097;

function send_sms(msg_content) {
    const body = {form: {
        mobile,msg_content
    }};

    request.post(url,body,(err,res) => {
        if(err){
            console.log(`告警短信发送失败`);
        }else{
            console.log(`告警短信发送成功`);
        }
    })
}


module.exports = send_sms;