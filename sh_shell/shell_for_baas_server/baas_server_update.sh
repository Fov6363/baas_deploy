#!/bin/bash

#用于更新baas_server端代码,用于59环境
#author by yuanyuan

is_npm_update="n"
baas_server_pwd="/data1/baas_server/"
is_down_load="n"

read -t 10 -p "是否要更新npm包(y/n)?" is_npm_update
read -t 10 -p "是否要下载npm包(y/n)?" is_down_load
echo "已选择$is_npm_update"
baas_list=`ls -l $baas_server_pwd | grep "nodejs_api"`

j=0
echo "========================================================> begin"
for i in $baas_list
do
	if [ -d $baas_server_pwd"$i" ]
	then
		echo $baas_server_pwd"$i"
		baas_dir[$j]=$baas_server_pwd"$i"
		((j++))
	fi
done

is_continue="y"
echo "=======================================================> end"
read -t 10 -p "请确认目录是否正确,是否要进行更新(y/n)?" is_continue
echo $is_continue
if [ "$is_continue" != "y" ]
then
	echo "退出!"
	exit 0
fi

echo ${#baas_dir[@]}
for single_dir in ${baas_dir[@]};
do
	cd $single_dir
	git pull
	if [ $is_down_load != "n" ]
	then
		npm install --registry=http://101.200.205.189:7001
	fi
	if [ $is_npm_update != "n" ]
	then
		npm update --registry=http://101.200.205.189:7001
	fi
done

is_pm2_restart="n"
read -t 10 -p "是否要重启所有项目?如果有错误,请检查错误(y/n)" is_pm2_restart
if [ "$is_pm2_restart" != "y" ]
then
	echo "不重启,正常退出!"
	exit 0
fi

pm2 restart all

pm2 l
sleep 1
pm2 l
sleep 1
pm2 l
sleep 1
pm2 l
