import os, sys
import json

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, desc

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask import Response

app = Flask(__name__)

#----------------------------------------------
# Return the homepage.

@app.route("/")
def home():
#    return '<h1> App started ... </h1>'
    return render_template("landing.html")

#Connect and Load data from csv into db:
from sqlalchemy import create_engine, ForeignKey
from sqlalchemy import Column, Date, Integer, String
from sqlalchemy.ext.declarative import declarative_base
engine = create_engine('sqlite:///db/Hurricane.sqlite', echo=False)
con = engine.connect()
con.execute('''CREATE TABLE IF NOT EXISTS Hurricanes(
                ID integer not null primary key, 
                Name Varchar (100),
                Time integer not null,
                Event Varchar (100),
                Status Varchar (100),
                Latitude integer not null,
                Longitude integer not null,
                Wind integer not null,
                Pressure integer not null,
                ISODate Varchar (100),
                Location Varchar (100)
                )''')

print("Creating database from csv file.")
csv_df = pd.read_csv('db/hurdat.csv', index_col=0)
csv_df.to_sql('Hurricanes', engine, if_exists='replace', index=True, index_label="id")

#landing page
@app.route("/")
def land():
    return render_template("landing.html")



# timeline.html related
from getFromDb import getEvents, makeGeo, getEventHeader

@app.route("/b_events")  #background process - get all events
def back_events():
    allEvents = getEvents(engine)
    #print(allEvents[0])
    return jsonify(list(allEvents)) 

@app.route("/b_eventHeader/<id_x>")  #background process - get header for single event
def eventXHeader(id_x):
    this_event_header = getEventHeader(engine,id_x)
   # print(this_event_header)
    return this_event_header.to_json()

@app.route("/b_events/<id_x>")  #background process - get info for single event
def eventX(id_x):
    this_event_geo = makeGeo(engine,id_x)
    #print(this_event_geo)
    return jsonify(this_event_geo)

@app.route("/timeline")
def events():
    #try:
    return render_template("timeline.html")
    #except Exception, e:
     #   return (str(e))


#----------------------------------------------
# Return the heatmap page.

@app.route("/heatmap")
def heatmap():
#    return '<h1> App started ... </h1>'
    return render_template("heatmap.html")

#----------------------------------------------
# Return data points for East Pacific 
#
@app.route("/epdatadb")
def epdatadb():

    id = "East Pacific"
    dftmp =  pd.read_sql('Select * from Hurricanes where location="'+id+'" Order by Date,Time',engine)
    points = {'type':'FeatureCollection', 'features':[]}

    for i in range(0,dftmp.iloc[0:].shape[0]) :
        points['features'].append(getdata(dftmp.iloc[i]))

    return jsonify(points)

#----------------------------------------------
# Return data points for Central Pacific 
#
@app.route("/cpdatadb")
def cpdatadb():

    id = "Central Pacific"
    dftmp =  pd.read_sql('Select * from Hurricanes where location="'+id+'" Order by Date,Time',engine)
    points = {'type':'FeatureCollection', 'features':[]}

    for i in range(0,dftmp.iloc[0:].shape[0]) :
        points['features'].append(getdata(dftmp.iloc[i]))

    return jsonify(points)

#----------------------------------------------
# Return data points for Atlantic 
#
@app.route("/aldatadb")
def aldatadb():

    id = "Atlantic"
    dftmp =  pd.read_sql('Select * from Hurricanes where location="'+id+'" Order by Date,Time',engine)
    points = {'type':'FeatureCollection', 'features':[]}

    for i in range(0,dftmp.iloc[0:].shape[0]) :
        points['features'].append(getdata(dftmp.iloc[i]))

    return jsonify(points)

#----------------------------------------------
# Utility : get data points from dataframe row 
#
def getdata (row) :
    return {'type':'Feature', 
            'geometry': {
                'type':'Point',
                'coordinates':[row['Longitude'],row['Latitude']]
            },
            'properties': {
                'windspeed':int(row['Wind']),
                'time':row['ISODate']
            }}


if __name__ == "__main__":
    app.run(debug=True)


