/**
 *  * Created by yuanyuan on 17/3/19.
 *   */
const Promise       = require('bluebird');
const exec          = require('child_process').exec;
const chalk         = require('chalk');

const pm2_l = 'pm2 l';
const pm2_show = 'pm2 show $id';
const show_git_branch = 'cd $PATH && git branch | grep \\*';

async function run() {
	    try{
		            let pm2_result = await run_command(pm2_l);
			            let baas_project_arr = parse_pm2_l_result(pm2_result);

				            let result = await Promise.map(baas_project_arr,async pm2_obj =>{
						                return await handle_single_baas_project(pm2_obj);
								        });


					            parse_result_to_pretty(result);
						        }catch (e){
								        console.log(`e = ${e.message}`);
									        console.log(`执行失败,已退出`);
										    }
}

function parse_result_to_pretty(result) {
	    let str = '';
	        let app_name_len = '───────────────────────'.length;
		    let id_len = '───'.length;
		        let branch_len = '──────────────────────'.length;
			    let path_len = '───────────────────────────────────────────'.length;

			        result.map(item => {
					        let name = item['name'];
						        let id = item['id'];
							        let branch = item['branch'];
								        let branch_length = branch.length;
									        let path = item['pwd'];

										        if(branch !== 'master'){
												            branch = chalk.red(branch);
													            }else{
															                branch = chalk.green(branch);
																	        }

																		        str += `│${chalk.green(item['name'])}${get_len(app_name_len - name.length)}│ ${item['id']}${get_len(id_len - id.length)}│ ${branch}${get_len(branch_len - branch_length)}│ ${item['pwd']}${get_len(path_len - path.length)}│\n`;
																			    });

				    str = str.slice(0,-2);

				        console.log('┌───────────────────────┬────┬───────────────────────┬────────────────────────────────────────────┐');
					    console.log(`│ ${chalk.blue('App name')}              │ id │ ${chalk.blue('branch')}                │ path                                       |`);
					        console.log('├───────────────────────┼────┼───────────────────────┼────────────────────────────────────────────┤');
						    console.log(str);
						        console.log('└───────────────────────┴────┴───────────────────────┴────────────────────────────────────────────┘');
}

function get_len(len) {
	    let str = ' ';
	        for(let i = 1;i < len;i++){
			        str += ' ';
				    }

				        return str;
}

function parse_pm2_l_result(pm2_result) {
	    let return_arr = [];

	        let pm2_result_arr = pm2_result.split('\n');
		    let pm2_result_use_arr = pm2_result_arr.slice(3,pm2_result_arr.length - 3);

		        if(pm2_result_use_arr.length === 0){
				        return return_arr;
					    }

					        return_arr = pm2_result_use_arr.map(item => {
							        let item_arr = item.split('│');
								        let baas_name = item_arr[1];
									        let baas_id = item_arr[2];

										        return {'name': baas_name,'id':baas_id};
											    });

						    return return_arr;
}

async function handle_single_baas_project(pm2_obj) {
	    let {name, id} = pm2_obj;
	        let pwd = await pm2_show_by_id(id);

		    let branch = await get_git_current_branch(pwd);
		        id = id.replace(/ /g,'');

			    return {
				            'name'    : name,
					            'id'    : id,
						            'pwd'  : pwd,
							            'branch'  : branch,
								        };
}

async function pm2_show_by_id(id) {
	    let pm2_show_result = await run_command(pm2_show.replace('$id',id));

	        let pwd = parse_pm2_show_result(pm2_show_result);

		    return pwd;
}

async function get_git_current_branch(pwd) {
	    let git_branch = await run_command(show_git_branch.replace('$PATH',pwd));

	        git_branch = git_branch.replace(/ /g,'');
		    git_branch = git_branch.replace(/\*/,'');
		        git_branch = git_branch.replace(/\n/,'');

			    return git_branch;
}

function parse_pm2_show_result(pm2_show_result) {
	    let regex = /exec cwd.*?\n/;
	        let regex_result = pm2_show_result.match(regex)[0];
		    let pwd = regex_result.split('│')[1].replace(/ /g,'');

		        return pwd;
}

function run_command(command) {
	    return new Promise(function (resolve,reject) {
		            exec(command,function (error,stdout,stderr) {
				                if(error){
							                reject(error);
									            }else{
											                    resolve(stdout);
													                }
															        });
			        })
}



run();

