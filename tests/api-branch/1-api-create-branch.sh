#!/bin/bash

function pause(){
   read -p "$*"
}


export XURL=http://localhost:8084/api/branch
export XREQ=create_branch_1.json
export XRES=create_branch_1.res

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