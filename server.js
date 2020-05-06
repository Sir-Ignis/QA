let express = require('express');
let Queue = require('bull');

// Serve on PORT on Heroku and on localhost:5000 locally
let PORT = process.env.PORT || '5000';
// Connect to a local redis intance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Create / Connect to a named work queue
let workQueue = new Queue('work', REDIS_URL);
let answerQueue = new Queue('answer', REDIS_URL);
let questionAnswer = "";

// Serve the two static assets
app.get('/', (req, res) => res.sendFile('index.html', { root: __dirname }));
app.get('/client.js', (req, res) => res.sendFile('client.js', { root: __dirname }));

// Kick off a new job by adding it to the work queue
app.post('/job', async (req, res) => {
  console.log("added job to queue");
  console.log("body: "+Object.values(req.body));
  let fileName = req.body.fileName;
  let question = req.body.question;
  try {
  let job = await workQueue.add({fileName: fileName, question: question});
  console.log(job.data);
  //res.render('index',{data:data});
  res.json({ id: job.id, question: question});
} catch(err) {
  console.log("err: "+err);
}
});

// Allows the client to query the state of a background job
app.get('/job/:id', async (req, res) => {
  let id = req.params.id;
  let job = await workQueue.getJob(id);

  if (job === null) {
    res.status(404).end();
  } else {
    let state = await job.getState();
    let progress = job._progress;
    let reason = job.failedReason;
    res.json({ id, state, progress, reason});
  }
});

app.get('/job/answer/:id', async (req, res) => {
  let id = req.params.id;
  let job = await answerQueue.getJob(id);
  if (job === null) {
    console.log("error! job = null");
    res.status(404).end();
  } else {
    const data = job.data;
    res.json({id, questionAnswer});
  }
});

workQueue.on('global:completed', (jobId, result) => {
  questionAnswer = result;
  console.log(`Job completed with result ${result}`);
  /*workQueue.getJob(jobId).then(function(job) {
  console.log(`Removing job#${jobId}`);
  job.remove();
});*/
});


app.listen(PORT, () => console.log("Server started!"));
