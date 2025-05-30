#!/bin/bash

function pause(){
   read -p "$*"
}

echo "Testing upload fiesld and file as multipart/form-data"
echo "result in response.res"

export XURL=http://localhost:8084/api/uplfile
export XRES=response1.res

XCURL="curl -k --verbose -X POST \"$XURL\" -o \"$XRES\" \
-F \"formfield1=myvalue1\" \
-F \"formfield2=myvalue2\" \
-F \"file=@krisa1.jpg\""
echo "$XCURL"
eval $XCURL

echo "press any key to continue"
pause