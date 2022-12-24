const fs = require('fs');
const folder = process.cwd()+'/public/';
const encoding = 'utf8';

function main(name){
	try{
		return fs.readFileSync(folder+name,encoding);
	}
	catch(ex){
		return undefined;
	}
}
module.exports=main;
