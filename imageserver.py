# imports
import sys, os, json, urllib, logging
from flask import Flask, request, make_response
from flask_cors import CORS, cross_origin
from datetime import datetime
from base64 import decodestring
# from OpenSSL import SSL

# global variables
# logging...

# server directory
webdir = os.path.dirname(os.path.realpath(__file__)) + "/web-content"
os.chdir(webdir)

# https keys
# context = SSL.Context(SSL.TLSv1_2_METHOD)
# context.use_privatekey_file('../ssl_auth/serverkey.pem')
# context.use_certificate_file('../ssl_auth/servercert.pem')

# flask app
app = Flask(__name__)
app.config.from_object(__name__)
cors = CORS(app, resources={r'/*': {'origins': '*'}})

@app.route('/imageserve', methods=['GET', 'POST', 'DELETE', 'OPTIONS'])
@cross_origin()
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
        return "Hello World!"
        # pass
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
            # print("POST blob: " + str(request_json['blob']))
            with open(webdir+"/img/"+request_json['filename'], 'wb') as fh:
                fh.write(response.file.read())
            return ("OK", 200)
    ## DELETE request
    if (request.method == 'DELETE'):
        request_json = request.get_json(silent=False)
        print("DELETE json:" + str(request_json))
        if (request_json and 'name' in request_json):
            try:
                os.remove(webdir+"/img/"+request_json['name'])
            except Exception as err:
                print("Exception: " + str(type(err)))
                print(err.args)
                print(err)
        return ("OK", 200)
## ~ data_broker fin ~ ##


## main function
if __name__ == '__main__':
    app.run()
    # app.run(host='127.0.0.1', debug=True, ssl_context=context)