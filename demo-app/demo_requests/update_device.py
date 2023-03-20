import requests
import json

### get id used during registering
with open('register_device.json') as json_file:
    myjson = json.load(json_file)
id=myjson['id']

to_update={"value":"H70.1T24.7L95.7C31.8",    "@context": ["https://raw.githubusercontent.com/smart-data-models/dataModel.Device/master/context.jsonld"]  }



response = requests.patch(url='http://localhost:1026/ngsi-ld/v1/entities/{entityId}/attrs/'.format(entityId=id), headers={"content-type": "application/ld+json"},  data=json.dumps(to_update))
print(response.__dict__)

