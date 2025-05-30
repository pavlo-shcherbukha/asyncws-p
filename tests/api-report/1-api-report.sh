#!/bin/bash

function pause(){
   read -p "$*"
}

echo "Testing upload fiesld and file as multipart/form-data"
echo "result in response.res"

export XURL=http://localhost:8082/api/report
export XREQ=report_1.json
export XRES=report_1.res

XCURL="curl -k --verbose -X POST \"$XURL\" \
--data \"@$XREQ\" \
-o \"$XRES\" \
--header \"Content-Type: application/json\" "
echo "$XCURL"
eval $XCURL

XCAT="cat \"$XRES\""
eval $XCAT

echo "press any key to continue"
pause