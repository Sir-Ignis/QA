const express = require('express');
const fs = require('fs');
const qa = require("./scripts/qa");
const util = require('util')
const spawn = require("child_process").spawn;

var app = express();
app.use(express.static('views'))
// Set EJS as templating engine
app.set('view engine', 'ejs');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const LOGS = "logs/log-file.txt";
const DIR = 'data/'
const pythonProcess = spawn('python',["scripts/extractWikiData.py"]);


app.get('/', async function (req, res) {
    var data = {reftext:null,q:null,answer:null,sysmsgs:null,logs:null};

var files = fs.readdirSync(DIR);

app.get('/', async function (req, res) {
    var data = {reftext:null,q:null,answer:null,sysmsgs:null,logs:null,files:files};

    var form = {fileName: req.body.fileName};

    console.log("Rendering: index page");
    res.render('index',{data:data,form:form});
});

app.post('/myform', async function(req, res, next){
    var fileName = req.body.fileName;
    var question = req.body.question;
    var log = "";
    if(qa.fileExists(fileName)) {
      logs = fs.readFileSync(LOGS,"utf8");
      logs = logs.split(/\r?\n/);
      var answer = await qa.main(fileName, question);

      var data = {reftext:qa.fetchText(fileName),q:question,answer:await Object.values(answer)[0],sysmsgs:null,logs:logs}

      var data = {reftext:qa.fetchText(fileName),q:question,answer:await Object.values(answer)[0],sysmsgs:null,logs:logs,files:files}

      res.render('index', {data:data});

      var data = {reftext:qa.fetchText(fileName),q:question,answer:await Object.values(answer)[0],sysmsgs:null,logs:logs,files:files}
      res.render('index', {data:data});

      var reftext = JSON.stringify(qa.fetchText(fileName));
      reftext = reftext.replace(/(\\n)+/g, '<br /><br />');
      var data = {reftext:reftext,q:question,answer:await Object.values(answer)[0],sysmsgs:null,logs:logs,files:files}
      var form = {fileName: fileName};
      res.render('index', {data:data,form:form});

    } else {
      logs = fs.readFileSync(LOGS,"utf8");
      logs = logs.split(/\r?\n/);
      var msg = "ERROR: file '"+fileName+"' does not exist!"
      console.log(msg);

      var data = {reftext:null,q:null,answer:null,sysmsgs:msg,logs:logs}

      var data = {reftext:null,q:null,answer:null,sysmsgs:msg,logs:logs,files:files}

      res.render('index', {data:data});

      res.render('index', {data:data});

      res.render('index', {data:data,form:form});

    }
});

var server = app.listen(5000, function () {
    console.log('Node server is running..');
});
