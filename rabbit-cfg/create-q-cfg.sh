#!/bin/bash


function pause(){
   read -p "$*"
}


echo "Creating RabbitMQ queue"


curl -u login:password -X PUT \
-H "Content-Type: application/json" \
-d '{"auto_delete":false,"durable":true,"arguments":{}}' \
http://localhost:15672/api/queues/%2F/wsq_requests


curl -u login:password -X PUT \
-H "Content-Type: application/json" \
-d '{"auto_delete":false,"durable":true,"arguments":{}}' \
http://localhost:15672/api/queues/%2F/wsq_uplfilerequests


#curl -u login:password -X PUT \
#-H "Content-Type: application/json" \
#-d '{"auto_delete":false,"durable":true,"arguments":{}}' \
#http://localhost:15672/api/queues/%2F/wsq_responses


echo "Creating RabbitMQ exchange"

curl -u login:password -X PUT \
-H "Content-Type: application/json" \
-d '{"type":"topic","durable":true,"auto_delete":false,"internal":false,"arguments":{}}' \
http://localhost:15672/api/exchanges/%2F/syncws_exchange



echo "Bind queue to exchange"

curl -u login:password -X POST \
-H "Content-Type: application/json" \
-d '{"routing_key":"api-srvc.create-branch.worker","arguments":{}}' \
http://localhost:15672/api/bindings/%2F/e/syncws_exchange/q/wsq_requests


curl -u login:password -X POST \
-H "Content-Type: application/json" \
-d '{"routing_key":"api-srvc.read-branch-list.worker","arguments":{}}' \
http://localhost:15672/api/bindings/%2F/e/syncws_exchange/q/wsq_requests


curl -u login:password -X POST \
-H "Content-Type: application/json" \
-d '{"routing_key":"api-srvc.read-time.worker","arguments":{}}' \
http://localhost:15672/api/bindings/%2F/e/syncws_exchange/q/wsq_requests



curl -u login:password -X POST \
-H "Content-Type: application/json" \
-d '{"routing_key":"api-srvc.uplfile.worker","arguments":{}}' \
http://localhost:15672/api/bindings/%2F/e/syncws_exchange/q/wsq_uplfilerequests


curl -u login:password -X POST \
-H "Content-Type: application/json" \
-d '{"routing_key":"api-srvc.report.worker","arguments":{}}' \
http://localhost:15672/api/bindings/%2F/e/syncws_exchange/q/wsq_uplfilerequests


#curl -u login:password
 -X POST \
#-H "Content-Type: application/json" \
#-d '{"routing_key":"res","arguments":{}}' \
#http://localhost:15672/api/bindings/%2F/e/syncws_exchange/q/wsq_responses


echo "press any key to continue"
pause