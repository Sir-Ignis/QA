/***
@version 0.1.0
@author Sir-Ignis

This is an open domain question answering (ODQA)
program that uses huggingface's question answering
model as a backend/abstraction to answer questions
about stored wikipedia articles.
*/

const fs = require('fs');
const util = require('util');
const DIR = 'data/txt/';
const PATH = 'data/dict.json';
const prompt = require('prompt-sync')();

let HIDE_TF_OUTPUT = true;
let SHOW_REF_TEXT = false;
let MIN_ANS_CERT = 70;
let SHOW_CERT = false;

const TF_MSG = "\n***TF OUTPUT***";
const STAR_TRAIL = "***************";
//holds question (key) and answers (value) pairs
let dict = {};

initialize();

console.log(TF_MSG);
const { QAClient } = require("question-answering");
console.log(STAR_TRAIL);
if(HIDE_TF_OUTPUT) {
  console.clear();
}

main();

function initialize() {
  var choice = prompt("Start with default options (y/n)? ").toLowerCase();
  if(choice === "n") {
    choice = prompt("Change standard or advanced options (s/a)? ").toLowerCase();
    if(choice === "s" || choice === "standard") {
      standardOptions();
    } else {
      advancedOptions();
    }
  }
}

function standardOptions() {
  var choice = prompt("Hide tensorflow output? ");
  if(choice === "n") {
    HIDE_TF_OUTPUT = false;
  }
  choice = prompt("Hide reference text? ");
  if(choice === "n") {
    SHOW_REF_TEXT = true;
  }
}

function advancedOptions() {
  standardOptions();
  var choice = prompt("Show answer certainty? ");
  if(choice === "y") {
    SHOW_CERT = true;
  }

  do {
  choice = prompt("Minimum answer certainty? ");
    if(0 > choice || choice > 100) {
      console.log("Error: 0 <= certainty <= 100");
    }
  }while(0 > choice || choice > 100);
  MIN_ANS_CERT = choice;
}

function chooseFile() {
  console.log("\n*******\n*FILES*\n*******");
  const files = fs.readdirSync(DIR);
  for(var i = 0; i < files.length; i++) {
    console.log(files[i]);
  }
  console.log();
  var choice = "";
  do {
    choice = prompt("Choose a file: ");
  }while (!(files.includes(choice)) && choice != "none");
  return choice;
}

function updateDictFile(dict) {
  /*check if question and answer already in dictionary
   *if not add the question and answer as key values
   *pair to the dict and update the json file*/
  const savedDict = JSON.parse(fs.readFileSync(PATH));
  for (var key in dict){
    if(!(key in savedDict) && (savedDict.key = dict[key])) {
      savedDict[key] = dict[key];
    }
  }
  fs.writeFileSync(PATH, JSON.stringify(savedDict));
}

async function addToDict(text, question, savedDict) {
  /*if the question is not in the dict and we are certain
   *of its answer with > 70% then add it to the dict*/
  if(!(question in savedDict)) {
    console.log(TF_MSG);
    const qaClient = await QAClient.fromOptions();
    console.log(STAR_TRAIL+"\n");
    if(HIDE_TF_OUTPUT){
      console.clear();
    }

    console.time("Fetched answer in: ");
    const answer = await qaClient.predict(question, text);
    console.timeEnd("Fetched answer in: ");

    const answerStr = Object.values(answer)[0];
    const certainty = Object.values(answer)[1]*100;
    if(certainty > MIN_ANS_CERT) {
      dict[question] = answerStr;
    }
    if(SHOW_CERT) {
      console.log('Answer: '+answerStr+' with '+certainty+'% certainty');
    } else {
      console.log('Answer: '+answerStr);
    }
  } else {
    console.log('Answer: '+savedDict[question]);
  }
}

async function answer(fileName) {
  const fileData = fs.readFileSync(DIR+fileName, "utf8");
  const text = fileData;

  if(SHOW_REF_TEXT) {
    console.log("\n******************\n"+fileName+"\n******************\n");
    console.log(text);
  }

  const savedDict = JSON.parse(fs.readFileSync(PATH));

  while (true) {
    console.log("\n")
    const question = prompt('Enter your question: ');
    if(String(question) === "none") {
      updateDictFile(dict);
      console.log("exiting...");
      return Promise.resolve("exit");
    }
    await addToDict(text, question, savedDict);
  }
}

async function main() {
  var fileName = chooseFile();
  if(fileName === "none") {
    return Promise.resolve("exit");
  }
  await answer(fileName);
}
