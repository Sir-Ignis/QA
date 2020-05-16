# QACLI
This simple question answering program uses [node-question-answering](https://github.com/huggingface/node-question-answering),
combined with Python to answer open questions based on Wikipedia text as a reference point.

Probable answers, i.e. answers with >70% certainty and their corresponding question are added as key value pairs to a dictionary,
so if the same question is asked again the system does not have to recompute the answer.

## Prerequisites
* [npm](https://www.npmjs.com/)
* [nodejs](https://nodejs.org/en/)
* [python](https://www.python.org/downloads/)

## Quickstart
```
npm install
npm start
```
## Demo

Using `Mining.txt`:
```
Enter your question: since when has mining been an activity?
Answer: pre-historic times with 83% certainty
```

## Command line flags
Type `scripts/QuestionAnswerer.js -h` to get info about using command line flags. Example:
```
node scripts/QuestionAnswerer.js -d "Free trade" -a -m file -tf true -rt false -sac true
```

## Using other data
You can add more data from wikipedia by using the command flag `-d <pageName>`, where `<pageName>` is the name of the wikipedia page that you want to download.

***

# QAWeb
Similar to QACLI but instead of answering questions through the CLI questions are asked and answered on a website via a form using express, redis and workers.

## Prerequisites
Same as QACLI plus:
* [redis](https://redis.io/download)

## Quickstart
1. run `npm install`
2. run `npm start` and goto `https://localhost:5000`

## QA with Background Workers in Node.js with Redis

Uses two bull queues to do the background work,
with one queue used to add the question and file name
as data and the other queue used to add the answer
as the queue data. This way we can always display some
kind of reference to the answer even if it hasn't been
calculated. The view is updated periodically so as to
ensure that if the user spam clicks the add job button
then we can display the correct view.
