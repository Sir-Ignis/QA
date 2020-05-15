#!/usr/bin/env bash
type -a python > data/.config
npx question-answering download
sudo pip3 install nltk
