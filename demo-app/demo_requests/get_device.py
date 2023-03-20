import requests
#get all registered devices with type of smart data models Device
url="http://localhost:1026/ngsi-ld/v1/entities?type=https://smartdatamodels.org/dataModel.Device/Device"

response = requests.get(url=url)
print(response.text)
