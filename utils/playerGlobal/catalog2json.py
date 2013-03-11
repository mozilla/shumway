# argv[1] is the xml file to convert
import xmltodict, json
f = open("bin/catalog.xml","r")
data = f.read()
o = xmltodict.parse(data)
print(json.dumps(o)) # '{"e": {"a": ["text", "text"]}}'

