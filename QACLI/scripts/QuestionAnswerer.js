/**
@version 0.1.3
@author Sir-Ignis

This is an open domain question answering (ODQA)
program that uses huggingface's question answering
model as a backend/abstraction to answer questions
about stored wikipedia articles.
*/

const fs = require('fs');
const util = require('util');
const DIR = 'data/txt/';
const WIKI = 'data/txt/wikipedia/';
const PATH = 'data/dict.json';
const CONFIG = 'data/.config';
const prompt = require('prompt-sync')();
const {PythonShell} = require('python-shell');
const { program } = require('commander');

let PYTHON_PATH = '';
let MODE = "default";
let HIDE_TF_OUTPUT = true;
let SHOW_REF_TEXT = false;
let MIN_ANS_CERT = 70;
let SHOW_CERT = false;

const TF_MSG = "\n***TF OUTPUT***";
const STAR_TRAIL = "***************";
//holds question (key) and answers (value) pairs
let dict = {};

console.log(TF_MSG);
let { QAClient } = require("question-answering");
console.log(STAR_TRAIL);
if(HIDE_TF_OUTPUT) {
  console.clear();
}

//help
program
  .option('-s, --standard', 'standard option', false)
  .option('-a, --advanced', 'advanced option', false)
  .option('-m, --mode <type>', 'question answering mode', MODE)
  .option('-tf, --tensorflow <boolean>', 'show/hide tensorflow output', HIDE_TF_OUTPUT)
  .option('-rt, --referencetext <boolean>', 'show/hide reference text', SHOW_REF_TEXT)
  .option('-mac, --minanscert <number>', 'minimum answer certainty', MIN_ANS_CERT)
  .option('-sac, --showanscert <boolean>', 'show/hide answer certainty', SHOW_CERT)
  .option('-h, --help', 'prints command argument info', false)
  .option('-d, --download <name>', 'downloads a wikipedia page called <name>', null)
  .parse(process.argv);

/****************
 * Entry point
 ***************/
 (async () => {
  getConfig();
  if(process.argv.length > 0) {
    try {
      await initialize();
    } catch(err) {
      console.log(err);
    }
  }

  main();
})();

/****************/

function getConfig() {
  fs.readFile(CONFIG, "utf8", (err, data) => {
  if(err){console.log(err);}else{
    data = data.split("\n"); // split the document into lines
    data.length = 1;    // set the total number of lines to 2
    console.log(data); //Array containing the 2 lines
    PYTHON_PATH = data[0].substring('python is '.length);
  }
  });
}

async function callPythonScript(scriptName, arg) {
  let messages = []
  let options = {
      mode: 'text',
      pythonPath: PYTHON_PATH,
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: 'scripts/',
      args: [arg]
  };

  let pyshell = new PythonShell(scriptName,options);

  pyshell.on('message', function (message) {
    console.log("[python output]: "+message);
  });

  // end the input stream and allow the process to exit
  pyshell.end(function (err,code,signal) {
    if (err) {throw err;}
    console.log('The exit code was: ' + code);
    console.log('The exit signal was: ' + signal);
    console.log('finished');
  });


  return new Promise((resolve, reject) => {
      pyshell.on('message', message  => {
        messages.push(message);
      });
      pyshell.end(err => {
        if(err) reject(err);
        resolve(messages);
      });
  });
}

/**
 * initializes the program options
 */
async function initialize() {
  if(program.help === true) {
    await help();
  }
  if (program.standard) {
    await standardOptions();
  }
  if(program.advanced) {
    await advancedOptions();
  }
  if(program.download != null) {
    await callPythonScript('extractWikiData.py', program.download);
    if(program.standard === false && program.advanced === false) {
      console.log('\n');
      prompt("Press enter to exit..");
      process.exit(0);
    } else {
      console.log('\n');
      prompt("Press enter to continue...");
      console.clear();
    }
  }
}

/**
 * prints command line arg info
 */
function help() {
  const fileData = fs.readFileSync(DIR + "CommandOptions.txt", "utf8");
  const text = fileData;
  console.clear();
  console.log('\n'+text+'\n');
  prompt('Press enter to continue...');
  return Promise.resolve();
}

/**
 * changes standard options: to show/hide
 * tensorflow output and reference
 * text
 */
function standardOptions() {
  if (program.mode) {
    MODE = program.mode
  }
  if (program.tensorflow) {
    program.tensorflow === "false" ? HIDE_TF_OUTPUT = false : HIDE_TF_OUTPUT = true;
  }
  if (program.referencetext) {
    program.referencetext === "false" ? SHOW_REF_TEXT = false : SHOW_REF_TEXT = true;
  }
  return Promise.resolve();
}

/**
 * changes advanced options: to show/hide
 * answer certainty and modify the min answer
 * certainty that adds the answer to dict
 */
function advancedOptions() {
  standardOptions();
  if(program.minanscert) {
    if(program.minanscert >= 0 && program.minanscert <= 100) {
      MIN_ANS_CERT = program.minanscert;
    }
  }
  if(program.showanscert) {
    program.showanscert === "true" ? SHOW_CERT = true : SHOW_CERT = false;
  }
  return Promise.resolve();
}

/**
 * choose a file from WIKI
 * @return {string} the filename or none
 * if no file is chosen
 */
function chooseFile() {
  console.log("\n*******\n*FILES*\n*******");
  const files = fs.readdirSync(WIKI);
  for (var i = 0; i < files.length; i++) {
    console.log(files[i]);
  }
  console.log();
  var choice = "";
  do {
    choice = prompt("Choose a file: ");
  } while (!(files.includes(choice)) && choice != "none");
  return choice;
}

/**
 * adds the question (key) and answer (value)
 * pair to the dict if it's not already in it
 * @param  {Object} dict used to store questions
 * and answers
 */
function updateDictFile(dict) {
  /*check if question and answer already in dictionary
   *if not add the question and answer as key values
   *pair to the dict and update the json file*/
  const savedDict = JSON.parse(fs.readFileSync(PATH));
  for (var key in dict) {
    if (!(key in savedDict)) {
      savedDict[key] = dict[key];
    }
  }
  fs.writeFileSync(PATH, JSON.stringify(savedDict));
}

/**
 * adds the questions and answer to the dict
 * if answer certainity > MIN_ANS_CERT
 * @param {[type]} text      from .txt file
 * @param {[type]} question  that the user asked
 * @param {[type]} savedDict stored dict.json
 */
async function addToDict(text, question, savedDict) {
  if (!(question in savedDict)) {
    console.log(TF_MSG);
    const qaClient = await QAClient.fromOptions();
    console.log(STAR_TRAIL + "\n");
    if (HIDE_TF_OUTPUT) {
      console.clear();
    }

    console.time("Fetched answer in: ");
    const answer = await qaClient.predict(question, text);
    console.timeEnd("Fetched answer in: ");

    const answerStr = Object.values(answer)[0];
    const certainty = Object.values(answer)[1] * 100;
    if (certainty > MIN_ANS_CERT) {
      dict[question] = answerStr;
      updateDictFile(dict);
    }
    if (SHOW_CERT) {
      console.log('Answer: ' + answerStr + ' with ' + certainty + '% certainty\n');
    } else {
      console.log('Answer: ' + answerStr + '\n');
    }
  } else {
    console.log('Answer: ' + savedDict[question]);
  }
}

/**
 * gets the answer for each question until
 * the user types none, to stop asking questions
 * @param  {string} fileName of file used to ask
 * questions
 */
async function answer(fileName) {
  const fileData = fs.readFileSync(WIKI + fileName, "utf8");
  const text = fileData;

  if (SHOW_REF_TEXT) {
    console.log("\n******************\n" + fileName + "\n******************\n");
    console.log(text);
  }

  const savedDict = JSON.parse(fs.readFileSync(PATH));

  while (true) {
    console.log("\n")
    const question = prompt('Enter your question: ');
    if (String(question) === "none") {
      updateDictFile(dict);
      console.log("exiting...");
      return Promise.resolve("exit");
    }
    await addToDict(text, question, savedDict);
  }
}

/**
 * add the question and answer key value pair
 * to the dictionary
 * @param  {[type]} fileName
 * @param  {[type]} question
 */
async function answerQuestion(fileName, question) {
  const fileData = fs.readFileSync(WIKI + fileName, "utf8");
  const text = fileData;

  if (SHOW_REF_TEXT) {
    console.log("\n******************\n" + fileName + "\n******************\n");
    console.log(text);
  }

  const savedDict = JSON.parse(fs.readFileSync(PATH));
  await addToDict(text, question, savedDict);
}

async function getFile(question) {
  const output = await callPythonScript('findFile.py', question);
  for(var str of output) {
    if(str.includes('FOUND')) {
      return str.substring(6);
    }
  }
}

/**
 * @return {Array} file name and question as an
 * array
 */
async function fetchFileAndQuestion() {
  const question = prompt('Enter your question: ').toLowerCase();
  var fileName = "none";
  if (String(question) != "none") {
    fileName = await getFile(question);
  }
  return [fileName, question];
}

/**
 * do QA for a specific file
 */
async function fileMode() {
  var fileName = chooseFile();
  if (fileName === "none") {
    return Promise.resolve("exit");
  }
  await answer(fileName);
}

/**
 * do QA based on keywords in the question
 */
async function defaultMode() {
  var data = [];
  do {
    var data = await fetchFileAndQuestion();
    if (data[0] != "none" && data[1] != "none") {
      await answerQuestion(data[0], data[1]);
    } else if (data[1] != "none") {
      console.log("I do not understand your question.\n");
    }
  } while (data[1] != "none");
}

/**
 * do QA based on the mode
 */
async function main() {
  if (MODE === "default") {
    await defaultMode();
  }
  else {
    await fileMode();
  }
}
