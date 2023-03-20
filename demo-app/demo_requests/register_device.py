import requests
import json

with open('register_device.json') as json_file:
    myjson = json.load(json_file)




response = requests.post(url='http://localhost:1026/ngsi-ld/v1/entities', headers={"content-type": "application/ld+json"},  data=json.dumps(myjson))
print(response.status_code)

