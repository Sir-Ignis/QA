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
  render();
}

// Fetch updates for each job
async function updateJobs() {
  for (let id of Object.keys(jobs)) {
    let result = null;
    let updated = false;
    if(jobs[id].answer === "?") {
    let res = await fetch(`/job/${id}`);
    result = await res.json();
    result.question = jobs[id].question;
    result.answer = jobs[id].answer;
    updated = true;
    }
    if(jobs[id].state === "completed" && jobs[id].answer === "?") {
      let res = await fetch(`/job/answer/${id}`);
      let answer = await res.json();
      let ans = Object.values(answer)[1].split(':')[1].split(',')[0].slice(1,-1);
      result.answer = ans;
      updated = true;
    }
    if (!!jobs[id] && updated) {
      jobs[id] = result;
    }
    render();
  }
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


function checkForUpdate() {
  let update = false;
  for (let id of Object.keys(jobs)) {
    if(jobs[id].answer === "?") {
      update = true;
    }
  }
  if(update === true) {
    updateJobs();
  }
}

// Attach click handlers and kick off background processes
window.onload = function() {
  document.querySelector("#add-job").addEventListener("click", addJob);
  document.querySelector("#clear").addEventListener("click", clear);
  setInterval(checkForUpdate, 2000);
};
