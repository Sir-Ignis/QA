import wikipedia
import os.path

DIR = "data/";
pages = ["Gold","Oil","Gas","Raw material","Farming","Fishing","Mining","Wheat","Sugar","Trade","Money","Crude oil", "Tax","Stock market", "Stock exchange", "Short (finance)", "Option (finance)"]

#downloads all wiki pages in pages array
#unless they are already in data dir
for p in pages:
    PATH = DIR+p+".txt";
    if not (os.path.isfile(PATH)):
        print("downloading: "+p+".txt")
        page = wikipedia.page(p)
        text_file = open(PATH, "w")
        text_file.write(page.content)
        text_file.close()
    else:
        print("FOUND "+PATH)
