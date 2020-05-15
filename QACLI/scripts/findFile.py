import os.path
import sys
import re
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize

global PATH
PATH = "data/txt/pages.txt"

f = open(PATH, "r")
global pages
pages = f.read().split(',');
f.close();

#0 question contains pages
#1 ... of x?
#2 ... x?
#3 ... is x ...?
#4 ... does x ...?

def extractWord(question):
    for page in pages:
        if(page.lower() in question.lower()):
            return page+'.txt'
    question = question.lower().split()
    print(question)
    #type 1
    if('of' in question and question.index('of')+1 < len(question)):
        return question[question.index('of')+1]
    #type 2
    elif(len(question) == 3 and question[0] == "what"):
        return question[-1]
    #type 3
    elif('is' in question and question.index('is')+1 < len(question)):
        if(question[question.index('is')+1]):
            return question[question.index('is')+1]
    #type 4
    elif('does' in question and question.index('does')+1 < len(question)):
        if(question[question.index('does')+1]):
            return question[question.index('does')+1]
    return 'none'


def stemWord(word):
    ps = PorterStemmer()
    stemmed = ps.stem(word)
    print(word, " stemmed is ", stemmed)
    return stemmed

def findWholeWord(w):
    return re.compile(r'\b({0})\b'.format(w), flags=re.IGNORECASE).search

def pickFile(stemmed):
    for page in pages:
        match = findWholeWord(stemmed)(page)
        if(match != None):
            file = page.strip('\n')+'.txt'
            return file
    print('Error! File not found')
    return 'none'

question = sys.argv[1]
word = extractWord(question)
file = 'none'
if word != 'none':
    if('.txt' not in word):
        stemmed  = stemWord(word)
        file = pickFile(stemmed)
    else:
        file = word
    print('FOUND '+file)
else:
    print('Error! File not found')
sys.stdout.flush()
