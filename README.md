<<<<<<< HEAD
# QACLI
This simple question answering program uses [node-question-answering](https://github.com/huggingface/node-question-answering),
combined with Python to answer open questions based on Wikipedia text as a reference point.

Probable answers, i.e. answers with >70% certainty and their corresponding question are added as key value pairs to a dictionary,
so if the same question is asked again the system does not have to recompute the answer.

## Prerequisites
* [python](https://github.com/python/cpython)
* [nodejs](https://nodejs.org/en/)
* [tfjs](https://github.com/tensorflow/tfjs)
* [node-question-answering](https://github.com/huggingface/node-question-answering)

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

## Using other data
You can use more data from wikipedia by modifying `extractWikiData.py`.
One simple way to do this would be to add to the array of pages, e.g.
`pages = ["Gold","Oil","Gas","Raw material","Farming","Fishing","Mining","Market economy"]`

***

# QAWeb
Similar to QACLI but instead of answering questions through the CLI questions are asked and answered on a website.
Question and answers are not saved to a dictionary in this version, however this will be implemented in future versions.

## Prerequisites
Same as QACLI plus more:
* [Express](https://expressjs.com/)
* [EJS](https://ejs.co/)

## Quickstart
1. run ``npm install``
2. run ``npm start`` and goto ``https://localhost:5000``
||||||| merged common ancestors
=======
# QA with Background Workers in Node.js with Redis

Uses two bull queues to do the background work,
with one queue used to add the question and file name
as data and the other queue used to add the answer
as the queue data. This way we can always display some
kind of reference to the answer even if it hasn't been
calculated. The view is updated periodically so as to
ensure that if the user spam clicks the add job button
then we can display the correct view.
>>>>>>> QA-Workers/master
