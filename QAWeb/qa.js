const { QAClient } = require("question-answering");
const fs = require('fs');
const util = require('util')
const DIR = 'data/'

async function fetchAnswer(text, question){
  try{
    const qaClient = await QAClient.fromOptions();
    var answer = await qaClient.predict(question, text);
    var answerStr = Object.values(answer)[0];
    var certainty = Object.values(answer)[1]*100;
    console.log('QUERY: Answer: '+answerStr+' with '+certainty+'% certainty');
    return answer;
  } catch(err) {
    console.log("fetchAnser(): "+err);
  }
}

function fetchText(fileName) {
  try {
  var fileData = fs.readFileSync(DIR+fileName, "utf8");
  var text = fileData;
  return text;
} catch(err) {
  console.log("fetchText(): "+err);
}
}

module.exports = {
  fileExists : function(fileName) {
    var files = fs.readdirSync(DIR);
    if(files.includes(fileName)) {
      return true;
    }
    return false;
  },
  fetchText: function(fileName) {
    console.log("I/O: Reading file "+DIR+fileName);
    const text = fs.readFileSync(DIR+fileName, "utf8");
    return text;
  },
  main: async function(fileName, question) {
    const answer = await fetchAnswer(fetchText(fileName), question);
    return answer;
  }
}
