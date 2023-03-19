import requests
import json

with open('register_device.json') as json_file:
    myjson = json.load(json_file)


url = 'http://localhost:1026/entities/{entityId}/attrs/'.format(entityId=myjson['id'])
print(url)

x = requests.post(url, json = myjson)

print(x.text)