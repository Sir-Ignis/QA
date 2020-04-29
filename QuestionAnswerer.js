const { QAClient } = require("question-answering");

//load the text file containing the info
const fs = require('fs');
const util = require('util')
const DIR = 'data/'
var prompt = require('prompt-sync')();

//to hold questions and answers
var dict = {};

function chooseData() {
  console.log("\n*******\n*FILES*\n*******");
  var files = fs.readdirSync(DIR);
  for(var i = 0; i < files.length; i++) {
    console.log(files[i]);
  }
  var choice = ""
  do {
    choice = prompt("Choose a file: ");
  }while (!(files.includes(choice)))
  return choice;
}

function updateDictFile(dict) {
  /*check if question and answer already in dictionary
   *if not add the question and answer as key values
   *pair to the dict and update the json file*/
  var savedDict = JSON.parse(fs.readFileSync('dict.json'));
  console.log(typeof(savedDict));
  for (var key in dict){
    if(!(key in savedDict) && (savedDict.key = dict[key])) {
      savedDict[key] = dict[key];
    }
  }
  fs.writeFileSync('dict.json', JSON.stringify(savedDict));
}

async function addToDict(text, question, savedDict) {
  /*if the question is not in the dict and we are certain
   *of its answer with > 70% then add it to the dict*/
  if(!(question in savedDict)) {
    const qaClient = await QAClient.fromOptions();
    const answer = await qaClient.predict(question, text);

    const answerStr = Object.values(answer)[0];
    const certainty = Object.values(answer)[1]*100;
    if(certainty > 70) {
      dict[question] = answerStr;
    }
    console.log('Answer: '+answerStr+' with '+certainty+'% certainty');
  } else {
      console.log('Answer: '+savedDict[question]);
  }
}

async function answer(fileName) {
  const fileData = fs.readFileSync(DIR+fileName, "utf8");
  const text = fileData;
  console.log("\n******************\n"+fileName+"\n******************\n");
  console.log(text);
  var savedDict = JSON.parse(fs.readFileSync('dict.json'));

  while (true) {
    console.log("\n")
    var question = prompt('Enter your question: ');
    if(String(question) === "exit") {
      updateDictFile(dict);
      console.log("exiting...");
      break;
    }
    await addToDict(text, question, savedDict);
  }
}

(async () => {
  var fileName = chooseData()
  await answer(fileName);
//DEBUGGING: prints key value pairs
for (var key in dict){
    console.log('Question: '+key);
    console.log('Answer: '+dict[key]);
}
})()
