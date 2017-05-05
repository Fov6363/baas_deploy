#!/bin/bash

#查看端口是否被占用

#当端口被占用时,返回no,当不被占用时,返回yes
function check_one_port_is_free(){
	
	local result=`lsof -i:$1`
	if [  "$result" != ""  ]
	then
		echo "no";
	else
		echo "yes";
	fi
}

function check_continue_port_is_free(){
	local start_port=$1;
	local loop=$2;
	local i=0;
	local result="yes";
	for ((i;i<$loop;i++))
	do
		local middle_result=`check_one_port_is_free $start_port`
		if [ "$middle_result" = "no" ]
		then
			result="no";
		fi
		(( start_port ++ ))
	done
	echo $result;
}

function get_free_port(){
	# mac gshuf   linux shuf
	local random_port=`shuf -i 2000-65000 -n 1`;
	local middle_result=`check_one_port_is_free $random_port`
	if [ "$middle_result" != "yes" ]
	then
		get_free_port	
	else
		echo "$random_port"
	fi
}

function get_continue_free_port(){
        #mac gshuf linux shuf 
	local random_port=`shuf -i 2000-65000 -n 1`;
	local i=0;
	for ((i=0;i<15;i++ ))
	do
		local middle_result=`check_one_port_is_free $random_port`
		if [ "$middle_result" = "no" ]
		then
			get_continue_free_port
		fi
		port_array[$i]=$random_port;
		(( random_port ++ ))
	done

	echo ${port_array[*]}
}

#使用方法
#result=`check_one_port_is_free 80`
#result=`check_continue_port_is_free 1000 5`
#echo "result=$result"
#result=`get_free_port`
#echo "result=$result"
#result=`get_continue_free_port`;
#echo "The result array is:${result[*]}"
