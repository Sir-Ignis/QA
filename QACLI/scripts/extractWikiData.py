import wikipedia
import os.path
import sys

global DIR
DIR = "data/txt/wikipedia/";
global PATH
PATH = "data/txt/pages.txt"

#downloads all wiki pages in pages array
#unless they are already in data dir
def download_pages():
    global PATH
    f = open(PATH, "r")
    pages = f.read().split(',');
    f.close();
    for p in pages:
        p = p.strip('\n')
        PATH = DIR+p+".txt";
        if not (os.path.isfile(PATH)):
            print("downloading: "+p+".txt")
            page = wikipedia.page(p)
            text_file = open(PATH, "w")
            text_file.write(page.content)
            text_file.close()
        else:
            print("FOUND "+PATH)

def addToPages(page):
    try:
        p = wikipedia.page(page)
        #try appending to first line of file
        try:
            with open(PATH, 'r') as original: data = original.read()
            data = data.strip('\n')
            if(page not in data):
                with open(PATH, 'w') as modified: modified.write(data+','+page.strip('\n'))
                print('Added '+str(page)+' to pages.txt')
            else:
                print(str(page)+' is already in pages!')

        except:
            print('Could not open file')
    except:
        print('Could not add page')


addToPages(sys.argv[1])
download_pages()
sys.stdout.flush()
