#!/bin/bash

function pause(){
   read -p "$*"
}


export XURL=http://localhost:8082/api/branch
export XRES=branchlist_1.res

XCURL="curl -k --verbose -X GET \"$XURL\" \
-o \"$XRES\" \
--header \"Content-Type: application/json\" "
echo "$XCURL"
eval $XCURL

XCAT="cat \"$XRES\""
eval $XCAT

echo "press any key to continue"
pause