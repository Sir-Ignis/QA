let throng = require('throng');
let Queue = require("bull");
let qa = require("./qa");

// Connect to a local redis intance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
let workers = process.env.WEB_CONCURRENCY || 2;

// The maxium number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
let maxJobsPerWorker = 50;

function start() {
  // Connect to the named work queue
  let workQueue = new Queue('work', REDIS_URL);
  let answerQueue = new Queue('answer', REDIS_URL);
  console.log("test");
  workQueue.process(maxJobsPerWorker, async (job) => {
    job.progress(100);
    result = qa.main(Object.values(job.data)[0],Object.values(job.data)[1]);
    console.log("result:"+result);
    const ans = await answerQueue.add({answer: result, id: job.id});
    console.log("answer id:"+ans.id);
  try{
    console.log("answer: "+Object.values(ans.data));
  }catch (err) {
    console.log(err);
  }
    return result;
  });
  answerQueue.process(maxJobsPerWorker, async(job) => {
    job.progress(100);
    return Object.values(job.data)[0];
  });
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });
