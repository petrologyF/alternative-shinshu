import codecs

path = r"c:/Users/climb/Documents/practice/alternative-shinshu/debug_output.txt"
with codecs.open(path, "r", encoding="utf-16") as f:
    data = f.read()
print(data)
