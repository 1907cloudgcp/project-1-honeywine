# imports
import sys, os, json, urllib, logging
from flask import Flask, request, make_response
from flask_cors import CORS, cross_origin
from datetime import datetime
from base64 import decodestring

# global variables
# logging...

# server directory
webdir = os.path.dirname(os.path.realpath(__file__)) + "/web-content"

# flask app
app = Flask(__name__)
cors = CORS(app)

@app.route('/', methods=['GET', 'POST'])
@cross_origin(origin="localhost", methods=['GET', 'POST'],             \
    allow_headers='Content-Type')
def image_server():
    """
    Responds to an HTTP request for local image storage.
    The image folder is periodically synchronized with storage bucket.
    """
    ## GET request
    if (request.method == 'GET'):
        ## retrieve pic from bucket or
        ## retrieving all data from DataStore...
        # print("passed through here...")
        pass
    ## POST request
    if (request.method == 'POST'): 
        ## saving image to local server
        request_json = request.get_json(silent=False)
        # print("POST json: " + str(request_json))
        # logger.log_text("POST json: " + str(request_json))
        if (request_json 
            and 'filename' in request_json
            and 'blob' in request_json):
            response = urllib.request.urlopen(request_json['blob'])
            with open(webdir+"/img/"+request_json['filename'], 'wb') as fh:
                fh.write(response.file.read())
            return ("OK", 200)
## ~ data_broker fin ~ ##