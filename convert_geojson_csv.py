import pandas as pd
import numpy as np
import json

with open('gb_lad.json') as f:
    data = json.load(f)

df = data['features']
las = []
for d in df:
    las.append(d['properties']['LAD13NM'])

las.sort()


with open('ni_lgd.json') as f:
    data = json.load(f)

df = data['features']
lgds = []
for d in df:
    lgds.append(d['properties']['LGDNAME'])

lgds.sort()

las.extend(lgds)
df = pd.DataFrame.from_dict({'Region': las})
df.to_csv('list_of_region_names.csv', index=False)