// Store for all of the jobs in progress
let jobs = {};

function validate(data) {
  if(data.fileName === "") {
    alert("No file name entered!");
    return false;
  } else if(data.question === "") {
    alert("No question entered!");
    return false;
  }
  return true;
}

// Kick off a new job by POST-ing to the server
async function addJob() {
var data = {fileName: document.getElementById("fileName").value,
            question: document.getElementById("question").value};
if(!validate(data)) {return;}
let job = await fetch('/job', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(data)
}).then(res => res.json())
.catch(error => console.log('Error:', error));

  jobs[job.id] = {id: job.id, question: job.question, answer: "?"};
}

async function updateJob(id) {
  let result = null;
  let res = await fetch(`/job/${id}`);
  result = await res.json();
  result.question = jobs[id].question;
  result.answer = jobs[id].answer;

  if(result.state === "completed") {
    let res = await fetch(`/job/answer/${id}`);
    let answer = await res.json();
    result.answer = answer.answer;
  }
  jobs[id] = result;
}

// Delete all stored jobs
function clear() {
  jobs = {};
  document.getElementById("fileName").value="",
  document.getElementById("question").value="";
  document.getElementById("answer").innerHTML="";
  render();
}

// Update the UI
async function render() {
  let s = "";
  for (let id of Object.keys(jobs)) {
    s += await renderJob(jobs[id]);
  }
  document.querySelector("#job-summary").innerHTML = s;
}

// Renders the HTML for each job object
async function renderJob(job) {
  let progress = job.progress || 0;
  let color = "bg-orange";
  let question = job.question;
  let answer = job.answer;
  if (job.state === "completed") {
    document.querySelector("#answer").innerHTML = job.answer;
    color = "bg-green";
    progress = 100;
  } else if (job.state === "failed") {
    color = "bg-red";
    progress = 100;
  }

  return document.querySelector('#job-template')
    .innerHTML
    .replace('{{question}}', question)
    .replace('{{color}}', color)
    .replace('{{answer}}', answer)
    .replace('{{progress}}', progress);
}


// Fetch updates for each job and render view
function checkForUpdate() {
  for (let id of Object.keys(jobs)) {
    if(jobs[id].answer === "?") {
      updateJob(id);
    }
  }
  render();
}

// Attach click handlers and kick off background processes
window.onload = function() {
  document.querySelector("#add-job").addEventListener("click", addJob);
  document.querySelector("#clear").addEventListener("click", clear);
  setInterval(checkForUpdate, 20000);
};
