/**
@version 0.1.4
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
//used to check if either any key or Ctrl+C was pressed
const keypress = async () => {
  process.stdin.setRawMode(true)
  return new Promise(resolve => process.stdin.once('data', data => {
    const byteArray = [...data]
    if (byteArray.length > 0 && byteArray[0] === 3) {
      console.log('^C')
      process.exit(1)
    }
    process.stdin.setRawMode(false)
    resolve()
  }))
}

//holds question (key) and answers (value) pairs
let dict = {};

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
 console.log(TF_MSG);
 let { QAClient } = require("question-answering");
 console.log(STAR_TRAIL);
 if(HIDE_TF_OUTPUT) {
   console.clear();
 }

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

/**
 * prints out Banner.txt
 */
function printBanner() {
  const fileData = fs.readFileSync(DIR + "Banner.txt", "utf8");
  const text = fileData;
  console.clear();
  console.log(text);
}

/**
 * assigns the python path in config to PYTHON_PATH
 */
function getConfig() {
  fs.readFile(CONFIG, "utf8", (err, data) => {
  if(err){console.log(err);}else{
    data = data.split("\n");
    data.length = 1;
    PYTHON_PATH = data[0].substring('python is '.length);
  }
  });
}

/**
 * runs python scriptName with arg
 * @param  {string} scriptName
 * @param  {string} arg
 * @return {Promise} if resolved returns an array of messages
 *                   else rejected then returns an error
 */
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
  if(process.argv.length < 3) {
    await Menu();

    const option = prompt('Option: ');

    if(option === 'h') {
      await help();
      console.clear();
    } else if(option === 'e') {
      console.clear();
      process.exit(0);
    } else {
      //otherwise clear screen and go to main()
      console.clear();
    }
  }
  if(program.help === true) {
    await help();
    console.clear();
  }
  if (program.standard) {
    await standardOptions();
  }
  if(program.advanced) {
    await advancedOptions();
  }
  if(program.download != null) {
    printBanner();
    await callPythonScript('extractWikiData.py', program.download);
    if(program.standard === false && program.advanced === false) {
      console.log('\n');
      console.log("Press any key to exit..");
      await keypress();
      process.exit(0);
    } else {
      console.log('\n');
      console.log("Press any key to continue..");
      await keypress();
      console.clear();
    }
  }

}
/**
 * prints Banner.txt followed by Menu.txt
 */
function Menu() {
  const fileData = fs.readFileSync(DIR + "Menu.txt", "utf8");
  const text = fileData;
  console.clear();
  printBanner();
  console.log(text);
  return Promise.resolve();
}

/**
 * prints command line arg info
 */
async function help() {
  const fileData = fs.readFileSync(DIR + "CommandOptions.txt", "utf8");
  const text = fileData;
  console.clear();
  printBanner();
  console.log('\n'+text+'\n');
  console.log("Press any key to continue..");
  await keypress();
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
 * @param {string} text from .txt file
 * @param {string} question that the user asked
 * @param {dictionary} savedDict stored dict.json
 */
async function addToDict(text, question, savedDict) {
  if (!(question in savedDict)) {
    console.log(TF_MSG);
    const qaClient = await QAClient.fromOptions();
    console.log(STAR_TRAIL + "\n");
    if (HIDE_TF_OUTPUT) {
      console.clear();
    }

    console.time("Fetched answer in");
    const answer = await qaClient.predict(question, text);
    console.timeEnd("Fetched answer in");
    console.log('Question: '+question);

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
  console.log("Press any key to continue..");
  await keypress();
  console.clear();
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
    const question = prompt('Enter your question: ');
    if (String(question) === "none") {
      updateDictFile(dict);
      console.log("exiting...");
      //return Promise.resolve("exit");
      process.exit(0);
    }
    await addToDict(text, question, savedDict);
  }
}

/**
 * add the question and answer key value pair
 * to the dictionary
 * @param  {string} fileName
 * @param  {string} question
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

/**
 * gets data txt file if found from question
 * @param  {string} question
 * @return {string} found file
 */
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
  if (typeof fileName === 'undefined') {
    console.log('Error! File undefined. Exiting...');
    process.exit(0);
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
    } else if (data[1] === "none") {
      process.exit(0);
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
