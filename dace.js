const http = require('http');
const templates = require('./templates.js');
const messages = require('./messages.js');
const crypto = require('crypto');
const querystring = require('querystring');
require('dotenv').config()
const port = (process.env.PORT || 1339);
let root = '';
const htmlHeaders = {
    'Content-Type': 'text/html; charset=utf-8'
};
const cjHeaders = {
    'Content-type': 'application/json; charset=utf-8' //vnd.collection+json'
};
const reHome = new RegExp('^\/$', 'i');
const reAbout = new RegExp('^\/about$', 'i');
const reMess = new RegExp('^\/message$', 'i');
const reList = new RegExp('^\/messages$', 'i');
const reItem = new RegExp('^\/messages\/.*', 'i');

const reAPIList = new RegExp('^\/api$', 'i');
const reAPIItem = new RegExp('^\/api\/.*', 'i');

const server = http.createServer(function (req, res) {

    root = 'http://' + req.headers.host;
    let parts = [];
    let segments = req.url.split('/');
    for (let i = 0, x = segments.length; i < x; i++) {
        if (segments[i] !== '') {
            parts.push(segments[i]);
        }
    }
    // handle routing
    flg = false;

    // home
    if (reHome.test(req.url)) {
        flg = true;
        if (req.method === 'GET') {
            sendHtmlHome(req, res);
        } else {
            sendHtmlError(req, res, 'Method Not Allowed', 405);
        }
    }
    // about
    if (flg === false && reAbout.test(req.url)) {
        flg = true;
        if (req.method === 'GET') {
            sendHtmlAbout(req, res);
        } else {
            sendHtmlError(req, res, 'Method Not Allowed', 405);
        }
    }
    //list
    if (flg === false && reList.test(req.url)) {
        flg = true;
        switch (req.method) {
            case 'GET':
                sendHtmlList(req, res);
                break;
            case 'POST':
                postHtmlItem(req, res);
                break;
            default:
                sendHtmlError(req, res, 'Not other methods', 405);
                break;
        }
    }
    // message
    if (flg === false && reMess.test(req.url)) {
        flg = true;
        switch (req.method) {
            case 'GET':
                sendHtmlMessage(req, res);
                break;
            case 'POST':
                postHtmlItem(req, res);
                break;
            default:
                sendHtmlError(req, res, 'Not other methods', 405);
                break;
        }
    }
    //item
    if (flg === false && reItem.test(req.url)) {
        flg = true;
        console.log(req.url)
        if (req.method === 'GET') {
            sendHtmlItem(req, res, parts[1]);
        } else {
            sendHtmlError(req, res, 'Not other methods', 405)
        }

    }

    //api

    //API LIST
    if (flg === false && reAPIList.test(req.url)) {
        flg = true;
        console.log("this is apilist")
        switch (req.method) {
            case 'GET':
                sendAPIList(req, res);
                break;
            case 'POST':
                postAPIItem(req, res);
                break;
            default:
                sendAPIError(req, res, "NOT OTHER API METHODS", 405)
                break;
        }
    }
    //API ITEM
    if (flg === false && reAPIItem.test(req.url)) {
        flg = true;
        switch (req.method) {
            case 'GET':
                sendAPIItem(req, res, parts[1]);
                break;
            case 'PUT':
                updateAPIItem(req, res, parts[1]);
                break;
            case 'DELETE':
                removeAPIItem(req, res, parts[1]);
                break;
            default:
                sendAPIError(req, res, "NOT OTHER API METHODS", 405)
                break;
        }

    }

    //404
    if (flg === false) {
        sendHtml404(req, res);
    }
});

server.listen(port,function(){
	console.log('                  '+'\n'+
         '  Server is listening on port: '+port+
                '                  ');
});


function sendHtmlHome(req, res) {
    let t;
    try {
        t = templates('index.html');
        t = t.replace(/{@host}/g, root);
        sendHtmlResponse(req, res, t, 200);
    }
    catch (ex) {
        sendHtmlError(req, res, 'Server Error', 500);
    }
}

function sendHtmlAbout(req, res) {
    let t;

    try {
        t = templates('about.html');
        t = t.replace(/{@host}/g, root);
        sendHtmlResponse(req, res, t, 200);
    }
    catch (ex) {
        sendHtmlError(req, res, 'Server Error', 500);
    }
}

function sendHtmlList(req, res) {
    let t, rtn, list, lmDate;

    try {
        rtn = messages('list');
        list = rtn.list;
        //console.log(list);
        lmDate = rtn.lastDate;
        t = templates('list.html');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@messages}/g, formatHtmlList(list));
        sendHtmlResponse(req, res, t, 200, new Date(lmDate).toGMTString());
    }
    catch (ex) {
        console.log(ex)
        sendHtmlError(req, res, 'Server Error', 500);
    }
}

function sendHtmlItem(req, res, id) {
    let t, rtn, item, lmDate;

    try {
        rtn = messages('item', id);
        //item = rtn.item;
        item = rtn;
        //console.log(rtn);
        //lmDate = rtn.lastDate;
        t = templates('item.html');

        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@msg}/g, formatHtmlItem(item));
        sendHtmlResponse(req, res, t, 200);
    }
    catch (ex) {
        console.log("wrong!")
        console.log(ex)
        sendHtmlError(req, res, 'Server Error', 500);
    }
}
function sendHtmlMessage(req, res, id) {
    let t, rtn, list, lmDate;

    try {
        rtn = messages('list');
        list = rtn.list;
        lmDate = rtn.lastDate;
        t = templates('message.html');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@messages}/g, formatHtmlList(list));
        sendHtmlResponse(req, res, t, 200, new Date(lmDate).toGMTString());
    }
    catch (ex) {
        sendHtmlError(req, res, 'Server Error', 500);
    }

}

function postHtmlItem(req, res) {
    let body, item, rtn, lmDate;
    body = '';
    req.on('data', function(chunk) {
        body += chunk.toString();
    });

    req.on('end', function() {
        try {
            item = messages('add', querystring.parse(body)).item;
            res.writeHead(303,'See Other', {'Location' : root+'/messages/'+item.id});
            res.end();
        }
        catch (ex) {
            sendHtmlError(req, res, 'Server Error', 500);
        }
    });
}

function sendAPIList(req, res) {
    let t, rtn, list, lmDate;
    console.log("this is process of apilist")
    try {
        rtn = messages('list');
        list = rtn.list;
        //lmDate = rtn.lastDate;
        //console.log(list);
        t = templates('collection.js');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@list}/g, formatAPIList(list));
        console.log(t)
        // sendAPIResponse(req, res, t, 200, new Date(lmDate).toGMTString());
        sendAPIResponse(req, res, t, 200);
    }
    catch (ex) {

        sendAPIError(req, res, 'Server Error', 500);
    }
}

function sendAPIItem(req, res, id) {
    let t, rtn, item, lmDate;

    try {
        rtn = messages('item', id);
        item = rtn;
        //lmDate = rtn.lastDate;

        t = templates('collection.js');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@list}/g, formatAPIItem(item));

        sendAPIResponse(req, res, t, 200);
    }
    catch(ex) {
        sendAPIError(req, res, 'Server Error', 500);
    }
}

function updateAPIItem(req, res, id) {
    let body, item, msg;

    body = '';
    req.on('data', function(chunk) {
        body += chunk;
    });

    req.on('end', function() {
        try {
            msg = JSON.parse(body);
            console.log(id, {message:msg.template.data[0].value});
            //console.log(msg);
            //console.log({message:msg.template.data[0]});
            item = messages('update', id, {message:msg.template.data[0].value});
            sendAPIItem(req, res, id);
        }
        catch(ex) {
            sendAPIError(req, res, 'Server Error', 500);
        }
    });
}

function removeAPIItem(req, res, id) {
    var t;

    try {
        messages('remove', id);
        t = templates('collection.js');
        t = t.replace(/{@host}/g, root);
        t = t.replace(/{@list}/g, formatAPIList(messages('list')));
        res.writeHead(204, 'No Content', cjHeaders);
        res.end();
    }
    catch(ex) {

        sendAPIError(req, res, 'Server Error', 500);
    }
}

function postAPIItem(req, res) {
    let body, item, msg;

    body = '';
    req.on('data', function(chunk) {
        body += chunk;
    });

    req.on('end', function() {
        try {
            msg = JSON.parse(body);
            item = messages('add', {message:msg.template.data[0].value});

            console.log("hello"+item);
            res.writeHead(201, 'Created', {'Location' : root + '/api/' + item.id});
            res.end();
        }
        catch(ex) {
            sendAPIError(req, res, 'Server Error', 500);
        }
    });
}

function formatHtmlItem(item) {
    var rtn;

    rtn = '<dl>\n';
    rtn +=  '<table align="center" border="1" cellpadding="3" cellspacing="0"}>' +
        '<caption>Message</caption>'+
        '<thead>' +
        '<tr><th>ID</th><th>POST_DATE</th><th>NAME</th><th>student_ID</th><th>Iphone</th><th>email</th><th>hobby</th></tr>'+
        '</thead>'+
        '<tbody>' +
        '<tr bgcolor="#B9F73E">  <td>'+
        item.id+
        '</td> <td>' +
        item.date+
        '</td> <td>' +
        item.message[0]+
        '</td> <td>' +
        item.message[1]+
        '</td> <td>' +
        item.message[2]+
        '</td> <td>' +
        item.message[3]+
        '</td> <td>' +
        item.message[4]+
        '</tr>'+
        '</tbody>'+
        '</table> ';
    rtn += '</dl>\n';
    return rtn;
}



function formatHtmlList(list) {
    let i, x, rtn;

    rtn =  '<table class="table-box" align="center" border="1" cellpadding="3" cellspacing="0"}>';
    rtn += '<caption>Messages</caption>'
    rtn +=  '<thead>' +
    '<tr><th>NAME</th><th>student_ID</th><th>Iphone</th><th>email</th><th>hobby</th></tr>'+
    '</thead>';

    rtn += '<tbody>';


    for(i=0,x=list.length;i<x;i++) {
        rtn +=
            '<tr bgcolor="#B9F73E" onclick="window.open(`root/messages/${list[i].id}`)" >  <td> <a href="'+root+'/messages/'+list[i].id+'" title="' + list[i].date+'">'+
            list[i].message[0]+
            '</a>'+
            '</td> <td>' +
            list[i].message[1]+
            '</td> <td>' +
            list[i].message[2]+
            '</td> <td>' +
            list[i].message[3]+
            '</td> <td>' +
            list[i].message[4]+
            '</td>'+
            '</tr>';

    }
    rtn+=+'</tbody>'+
        '</table> ';
    return rtn;
}

function sendHtmlResponse(req, res, body, code, lmDate) {
    res.writeHead(code,
            {'Content-Type' : 'text/html; charset=utf-8',
            'ETag' : generateETag(body),
            // 'Last-Modified' : lmDate});
        });
    res.end(body);
}


function formatAPIList(list) {
    let i, x, rtn, item;

    rtn = [];
    for(i=0,x=list.length; i<x; i++) {
        item = {};
        item.href = root + '/api/' + list[i].id;
        item.data = [];
		item.data.push({name:"text", value:{"name":list[i].message[0],
                                                    "id":list[i].message[1],
                                                    "phone":list[i].message[2],
                                                    "email":list[i].message[3],
                                                    "hobby":list[i].message[4]
                                                    }});
        item.data.push({name:"date_posted", value:list[i].date});
        rtn.push(item);
    }

    return JSON.stringify(rtn, null, 4);
}

function formatAPIItem(item) {
    var rtn = {};

    rtn.href = root + '/api/' + item.id;
    rtn.data = [];
    rtn.data.push({name:"text", value:item.message});
    rtn.data.push({name:"date_posted", value:item.date});

    return "[" + JSON.stringify(rtn, null, 4) + "]";
}

function sendHtml404(req, res, title, code) {
    	let t;
	t=templates('404.html');
	t=t.replace(/{@host}/g,root);
	sendHtmlResponse(req,res,t,404);
}

function sendHtmlError(req, res, title, code) {
    var body = '<h1>' + title + '<h1>';
    sendHtmlResponse(req, res, body, code);
}


function sendAPIResponse(req, res, body, code, lmDate) {
    res.writeHead(code,
        {"Content-Type" : "application/json; charset=utf-8",
            "ETag" : generateETag(body),
            // "Last-Modified" : lmDate});
        });
    res.end(body);
}

function sendAPIError(req, res, title, code) {
    var err, t;

    err = {collection : {
                version : "1.0", href : "{@host}/api/",
                error : {title : title, code : code}
            }
        };

    t = JSON.stringify(err);
    t = t.replace(/{@host}/g, root);
    res.writeHead(code, 'Server Error', cjHeaders);
    res.end(t)
}
function generateETag(data) {
    let md5;
    md5 = crypto.createHash('md5');
    md5.update(data);
    return '"'+ md5.digest('hex') + '"';
}
