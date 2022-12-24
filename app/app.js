#!/usr/bin/env node
//methods=["GET","POST","UPDATE","DELETE"];
console.log(`
 #####                              
 #    #                             
 #     #   ######   #####    #####  
 #     #  #     #  #        #     # 
 #     #  #     #  #        ####### 
 #    #   #    ##  #        #       
 #####     #### #   #####    #####  
                                   `
)
const program = require('commander');
const axios = require("axios");
require('dotenv').config()
const hostname = process.env.IP || "127.0.0.1";
const port = process.env.PORT || 1339;
const net = require('net');
const url=`http://${hostname}:${port}/api`;

// 检测服务器是否启动
function serviceIsOccupied () {
	// 创建服务并监听该端口
	try{
		const server = net.createServer().listen(port);
		server.close()
	}
	catch(e) {
		console.log('The server on the ' + hostname + ':' + port + ' is unavailable.' + '\n' + 'please check the server') // 控制台输出信息
	}
}

program
    .version('0.0.1')

program    
    .option('-a, --add [item]', 'Add a new item')
         .option('-n name <name>','name')
         .option('-i id <id>','id')
         .option('-m mobile <mobile>','mobile')
         .option('-b hobby <hobby>','hobby')
    .option('-d, --delete <delete_id>', 'Delete a existed item')
    .option('-u, --update <update_id>', 'update a existed item')
    .option('-l, --list [list]', 'sorted output to Terminal' )
    .parse(process.argv);
const options = program.opts();
flg=0;

if((options.add===undefined&&options.update===undefined)&&(options.name||options.id||options.mobile||options.hobby)) console.log('not add methods added!!please add such one!');
if(options.add&&(options.update||options.delete||options.list) || (options.update&&(options.delete||options.list)) || (options.delete&&options.list))
{console.log(options.update);console.log("too much args,please select a specified method!");return;}


//"POST"
if(options.add&&options.name&&options.id&&options.mobile&&options.hobby)
{
	flg=flg+1;
	value=[options.name,
		options.id,
		options.mobile,
		options.hobby];
	headers={
		'Content-Type':'application/json'
	} ;
	data = {
		"template": {
			"data": [
				{"name": "text", "value": value}
			]
		}
	};
	console.log("add method used!");
	axios.post(url,data).then(res=>{
		console.log("正在上传");
		console.log("上传成功",res.data);
	}).catch(res=>{
			console.log(res.data);
		}
	);
}
else if(options.add){
	flg=flg+1;
	console.log("please fill up  four items after -a!!")}

//'DELETE'
if(options.delete) {
	flg = flg + 1;
	api='/'+options.delete;
    console.log("delete method used!");
	console.log('delete'+options.delete)
	axios.delete(url+api).then(res=>{
		console.log("正在删除");
		console.log("删除成功",res.data);
	}).catch(res=>{
		console.log("请检查是否存在此条目")
		}
	);
}

//‘UPDATE'
if(options.update)
{
	flg=flg+1;
	async function origin(){
		let data='';
		await axios.get(url+'/'+options.update).then(res=>{
			data=res.data.collection.items[0].data[0].value;
		}).catch(res=>{
				console.log("请检查是否存在此条目")
			}
		);
		//console.log(data)
		return data;
	}
	origin().then(res =>{
		//console.log(res)
		let new_data=[options.name?options.name:res[0],options.id?options.id:res[1],
			options.mobile?options.mobile:res[2],'panpengf@gmail.com',options.hobby?options.hobby:res[3]]
		//console.log(new_data)
		let checked_data = {
			"template": {
				"data": [
					{"name": "text", "value": new_data}
				]
			}
		};
		axios.put(url+'/'+options.update,checked_data).then(res=>{
			console.log(res.data);
			console.log('修改成功');
		}).catch(res=>{
				console.log("请检查是否存在此条目")
			}
		);
	});

}

//"GET"
if(options.list) {
	console.log('list'+options.list);
	flg = flg + 1;
	console.log("list method used!");
    if(options.list==='ascend')
	    sort_app(url).then(res => console.log(res));
	else if(options.list === true)
		sort_app(url).then(res => console.log(res.slice().reverse()));
	else console.log("check the parameters")
}
//sort
async function sort_app(api_url){
	let itemgood = [];
	let itemnews = [];
	await axios.get(api_url,)
		.then(res => {
			let items = res.data.collection.items

			//let itemgood = [];
			items.forEach(e=>{
				itemnews.push(e.data)
			})
			itemnews.sort(function(a,b){
				const a_time = new Date(a[1].value);
				const b_time = new Date(b[1].value);
				return a_time-b_time
			})
			//console.log(itemnews);
			for(let n=0; n<itemnews.length; n++){
				itemgood.push(itemnews[n][0].value)
			}
			//console.log(itemgood);
		})
		.catch(error => {
			console.log(error);
		});
	return itemgood;
}




