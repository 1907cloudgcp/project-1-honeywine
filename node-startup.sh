## change directory
dir="`pwd`/`dirname "$0"`"
cd ${dir}

## node server variables
export SERVER_CERT="${dir}/ssl_auth/servercert.pem"
export SERVER_KEY="${dir}/ssl_auth/serverkey.pem"
export SERVER_PASS="password"

## start server
npm start

