/**
 * Created by yuanyuan on 17/5/15.
 */

class SystemLog{
    get_info(){
        return `id = ${this.id} ,cpu = ${this.cpu} ,memory = ${this.memory} ,storage = ${this.storage} ,time = ${this.time}`;
    }
}

module.exports = SystemLog;