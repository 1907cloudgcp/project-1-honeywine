## change directory
dir="`pwd`/`dirname "$0"`"
cd ${dir}

## node server variables
export SERVER_CERT="${dir}/ssl_auth/servercert.pem"
export SERVER_KEY="${dir}/ssl_auth/serverkey.pem"
export SERVER_PASS="password"

## source python environment
source env/bin/activate

## flask image server variables
export FLASK_APP=imageserver.py
python -m flask run 1>>"${dir}/imageserver.log" 2>&1 & disown

## start node server
npm start

