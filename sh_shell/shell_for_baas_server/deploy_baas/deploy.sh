#!/bin/bash

#only apply 59.110.21.9 env
#if want to apply other env,please update ip.redis->ip.mongo->data;

#need arg name,such x20
#require check_port
. ./check_port.sh

read -t 10 -p  "请输入Baas新名称:" name
		
if [ -n "$name" ]
then
	echo "得到name 等于 $name"
else
	echo "没有name输入,已自动退出"
	exit 0
fi
echo "获得可用name: $name"

cur_baas_server_pwd="/data1/baas_server/nodejs_api_$name"
if [ -e $cur_baas_server_pwd ]
then
	echo "文件已存在,不能覆盖已有baas文件,请重新输入"
	exit 0
else
	echo "文件不存在,即将创建 $cur_baas_server_pwd"
fi
is_continue_clone="y"
read -t 10 -p "clone开始并创建目录$cur_baas_server_pwd,是否要继续(y/n)?:" is_continue_clone

if [ "$is_continue_clone" != "y" ]
then 
	echo "程序中止,已自动退出"
	exit 0
fi

git clone git@101.200.205.189:geekniu_baas/nodejs_api.git $cur_baas_server_pwd

echo "-------------------------------------华丽的分割线----------------------------------------------------"
echo "npm包因为极不稳定,需使用cnpm或yarn或npm手动下载"

echo "-------------------------------------开启Mongo-------------------------------------------------------"

mongo_port=`get_free_port`

is_continue_mongo="y"
read -t 10 -p "Mongo的端口为$mongo_port,是否要创建mongo并启动(y/n)?" is_continue_mongo

if [ $is_continue_mongo != "y" ]
then
	echo "程序中止"
	mv $cur_baas_server_pwd /tmp/
	echo "创建的文件目录已被移到/tmp目录下,确认目录无误后删除"
	exit 0
fi

cp ./mongo_server_template.conf ./mongo_server_$name.conf

sed -i "s/shell_name/$name/g" ./mongo_server_$name.conf
sed -i "s/shell_port/$mongo_port/g" ./mongo_server_$name.conf

mongo_server_pwd="/var/lib/mongo_server_$name"

if [ -e $mongo_server_pwd ]
then
	echo "文件已存在,不能覆盖已有mongo数据文件,已退出"
	exit 0
else
	echo "---开始创建mongo的data文件 $mongo_server_pwd"
fi
mkdir $mongo_server_pwd

echo "---开始启动mongo"
mongod --config ./mongo_server_$name.conf

echo "mongo启动完成,请将当前目录下的.conf文件移至/etc/目录下--------"

echo "----------------华丽的二次分割线-------开启Redis配置---------------------------cur_path="pwd"--------------------------"

redis_port_array=(`get_continue_free_port`)
echo "---redis port如下:${redis_port_array[*]}"
for i in "${redis_port_array[@]}"
do
	cp ./redis_template.conf ./redis-$i.conf
	sed -i "s/shell_port/$i/g" ./redis-$i.conf
	redis-server ./redis-$i.conf
done

echo "----------------------Redis启动完毕,请检查端口和服务,请将.conf文件移到/data1/redis下面"

echo "-----------------------开始修改工程下的redis配置文件的ip和端口----------------"

cd $cur_baas_server_pwd/models

vi redis_counter_custom.js -c ':%s/10.44.142.196/10.27.73.14/g' -c ':wq'
vi redis_counter_index.js -c ':%s/10.44.142.196/10.27.73.14/g' -c ':wq'
vi redis_counter.js -c ':%s/10.44.142.196/10.27.73.14/g' -c ':wq'
vi redis_queue.js -c ':%s/10.44.142.196/10.27.73.14/g' -c ':wq'

#replace port
sed -i "s/6400/${redis_port_array[0]}/g" ./redis_counter.js
sed -i "s/6401/${redis_port_array[1]}/g" ./redis_counter.js
sed -i "s/6402/${redis_port_array[2]}/g" ./redis_counter.js
sed -i "s/6403/${redis_port_array[3]}/g" ./redis_counter.js
sed -i "s/6404/${redis_port_array[4]}/g" ./redis_counter.js
sed -i "s/6411/${redis_port_array[11]}/g" ./redis_counter.js
sed -i "s/6412/${redis_port_array[12]}/g" ./redis_counter.js
sed -i "s/6413/${redis_port_array[13]}/g" ./redis_counter.js

sed -i "s/6405/${redis_port_array[5]}/g" ./redis_counter_index.js
sed -i "s/6406/${redis_port_array[6]}/g" ./redis_counter_index.js
sed -i "s/6407/${redis_port_array[7]}/g" ./redis_counter_index.js
sed -i "s/6408/${redis_port_array[8]}/g" ./redis_counter_index.js
sed -i "s/6409/${redis_port_array[9]}/g" ./redis_counter_index.js


sed -i "s/6410/${redis_port_array[10]}/g" ./redis_counter_custom.js
sed -i "s/6411/${redis_port_array[11]}/g" ./redis_queue.js

echo "--------------------Redis配置完成,请查看工程下的diff,看是否正确"
echo "--------------------请手动修改env.js文件中的Mongo port和server port"
echo "--------------------还要更新npm包哦"
echo "--------------------执行完毕,退出!"
exit 0
