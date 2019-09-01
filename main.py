# imports
import google.cloud.datastore as gcloudd
import google.cloud.logging as logging
import json
from flask import Flask, request, make_response
from flask_cors import CORS, cross_origin
from datetime import datetime

# global variables
# logging_client = logging.Client()
# log_name = 'projects/revgcp-project1-trial/logs/cloudfunctions.googleapis.com/' \
#             + 'cloud-functions'
# logger = logging_client.logger(log_name)

# flask app
app = Flask(__name__)
cors = CORS(app)

@app.route('/', methods=['GET', 'POST', 'DELETE'])
@cross_origin(origin="*", methods=['GET', 'POST', 'DELETE'],                    \
            allow_headers='Content-Type')
def data_broker(request):
    """
    Responds to an HTTP request for depositing form data into DataStore.
    """
    # ## Set CORS headers for the preflight request
    # if request.method == 'OPTIONS':
    #     ## Allows GET requests from any origin with the Content-Type
    #     ## header and caches preflight response for an 3600s
    #     headers = {
    #         'Access-Control-Allow-Origin': '*',
    #         'Access-Control-Allow-Methods': 'GET, POST',
    #         'Access-Control-Allow-Headers': 'Content-Type',
    #         'Access-Control-Max-Age': '3600',
    #     }
    #     return ('', 204, headers)
    
    # ## Set CORS headers for the main request
    # headers = {
    #     'Access-Control-Allow-Origin': '*',
    # }

    ## main request
    ## GET request
    if (request.method == 'GET'):
        ## retrieve pic from bucket or
        ## retrieving all data from DataStore...
        print("GET ")
        client = gcloudd.Client(project='revgcp-project1-trial',
                                    namespace='proj1_records')
        query = client.query(kind='client_record')
        data = [ dict(e) for e in list(query.fetch()) ]
        print(data)
        return (json.dumps(data), 200)
    ## POST request
    if (request.method == 'POST'): 
        ## posting from form data to DataStore...
        request_json = request.get_json(silent=False)
        print("POST json: " + str(request_json))
        # logger.log_text("POST json: " + str(request_json))
        if (request_json 
            and 'name' in request_json
            and 'width' in request_json
            and 'height' in request_json):
            client = gcloudd.Client(project='revgcp-project1-trial',
                                    namespace='proj1_records')
            key = client.key('client_record', request_json['name'])
            entity = gcloudd.Entity(key=key)
            entity.update({
                'name': request_json['name'],
                'width': request_json['width'],
                'height': request_json['height'],  
                'timestamp': str(datetime.now()),          
            })
            print("POST entity: " + str(entity))
            # logger.log_text("POST entity: " + str(entity))
            client.put(entity)
            print("put complete")
            return ("OK", 200)
    if (request.method == 'DELETE'):
        ## deleting data from DataStore...
        request_json = request.get_json(silent=False)
        print("DELETE json:" + str(request_json))
        if (request_json and 'name' in request_json):
            client = gcloudd.Client(project='revgcp-project1-trial',
                                    namespace='proj1_records')
            key = client.key('client_record', request_json['name'])
            client.delete(key)
            print("delete complete")
            return ("OK", 200)
## ~ data_broker fin ~ ##