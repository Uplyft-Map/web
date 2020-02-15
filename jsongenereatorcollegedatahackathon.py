import json
import random

def loaddata(data, n):
    names = []
    frequency = []
    schoolsize = []
    coordinates = []
    depressionindex = []
    posttotal = []
    top5words = []
    for i in range(n):
        names.append("school"+str(i))
        frequency.append(random.random()*100)
        schoolsize.append(random.randrange(1000))
        coordinates.append([random.randrange(1300),random.randrange(700)])
        depressionindex.append(random.random())
        posttotal.append(random.randrange(100, 2000))
        top5words.append(["apes","yeeewt", "kmao", "aditya", "sexy k"])
    data['schools'] = []
    for i in range(n):
        data['schools'].append({
            'names': names[i],
            'frequency': frequency[i],
            'schoolsize': schoolsize[i],
            'coordinates': coordinates[i],
            'depressionindex': depressionindex[i],
            'posttotal': posttotal[i],
            'top5words': top5words[i]
        })
    return data


data = loaddata({}, 10)



with open('data.json', 'w') as outfile:
    json.dump(data, outfile)