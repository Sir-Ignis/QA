# QA
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
npm install question-answering@latest
npx question-answering download
py extractWikiData.py
node QuestionAnswerer.js 
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
