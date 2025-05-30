# Project asyncws - Prototype async web service with Node.js and Rabbit MQ


## Used tools
- [Docker RabbitMQ](https://hub.docker.com/_/rabbitmq/)
- [odered/node-red Docker image](https://hub.docker.com/r/nodered/node-red)
- [Docker Compose](https://docs.docker.com/compose/)


## Useful links

### Rabbit MQ

- [Rabbit tutorials](https://www.rabbitmq.com/tutorials)
- [habre](https://habr.com/ru/articles/434510/)
- [@mnn-o/node-red-rabbitmq 1.0.2](https://flows.nodered.org/node/@mnn-o/node-red-rabbitmq)
- [FlowFuse: Using AMQP with Node-RED](https://flowfuse.com/node-red/protocol/amqp/)


## Run it in docker composer

Node Red is running in container. All containers are starting  using docker-compose. The  Node-Red image is running from custom image which is described in **nodered.dockerile**. 
All necessary containers and environment variables are gathered on docker-compose file **docker-compose.yaml**.

1. Change environment variables according to your configurations
Put is this variables parameters of your repository which wiil be cloned during docker build phase. In the same time it allow you enter into container and push your changes back to github repository.  Then **GIT_PSW** argument means github token which is using for https connection to github.



```yaml
  wrk-srvc:
    build:
      context: .
      dockerfile: ./nodered.dockerfile 
      args:
        GIT_USER: github username
        GIT_PSW: github toekn
        GIT_BRANCH: github branch
        GIT_REPO: git hub reppo
        GIT_EMAIL: email
        FLOWS: "/data/wrk-srvc/worker_nr.json"    


```

You can explicitly set up flow file which your want to run  by set up the environment variable **FLOWS**

```yaml

    environment:
      RABBITMQ_USER: " login "
      RABBITMQ_PASSWORD: " psw"
      RABBITMQ_HOST: "rabbitmq"
      RABBITMQ_PORT: "5672"      
      FLOWS: "/data/wrk-srvc/worker_nr.json"    
```

2. Build and run compose


```bash
    docker-compose -f  docker-compose.yml up --remove-orphans --force-recreate --build -d

    # run with scale
    docker-compose -f  docker-compose.yml  up --scale api-srvc=2 -d
```


3. Stop compose

```bash
   docker-compose -f  docker-compose.yml  stop
```

- view log particular service  api-srvc

```bash
docker compose -f  docker-compose.yml  logs -f api-srvc
```

- restart
```bash
docker compose -f docker-compose.yml restart api-srvc
```



3. Store your changes in github

- Enter into **Node-Red** container

```bash
    docker exec -it <container id> bash

```
- Enter into node.js container 

```bash
    docker exec -it <container id> sh
    ## enter into node-red service by container name
    docker exec -it asyncws_wrk-srvc_1 bash

```

- Change directory

```bash
    cd /data

```

- enter your git commands

```bash

    git status
    git add <filenamr>
    git commit -m "message"
    git push

```

## remove node-red container and images

docker container  rm asyncws_wrk-srvc_1
docker image rm asyncws_wrk-srvc


## Access application

Node.js Rest API: http://localhost:8082/api/
Node-Red: http://localhost:1880/
RabbitMQ: http://localhost:15672





##  api-srvc Web API Description

### create branch. Method: HTTP-POST, Path: /api/branch. 

Simple Rest APi. 

- Json - request, 
```json
{ 
  "branch_code":"011", 
  "branch_name": "head office", 
  "address": "Kyiv  khreschatic 1 office 3"
}
```
- Json response.

```json
{"ok":true,"branchid":"1234-4321-2222-3333"}
```

### Get branch list . Method: HTTP-GET, Path: /api/branch. 

Simple Rest APi. 
- request: no body, no params
- response:

```json
{
  "branchlist": [
    {
      "branch_code": "001",
      "branch_name": "head office",
      "address": "Kyiv  khreschatic 1 office 3"
    },
    {
      "branch_code": "002",
      "branch_name": "trabe office",
      "address": "Kyiv  main square 1 office 33"
    },
    {
      "branch_code": "003",
      "branch_name": "west office",
      "address": "Lutsk  Scorik street 22 office 133"
    },
    {
      "branch_code": "004",
      "branch_name": "east office",
      "address": "Pltava  Gogol street 4 office 5"
    }
  ]
}
```

### Get global time Method: HTTP-POST, Path: /api/globaltime. 


Simple Rest APi. 
- request
{
    "region": "Europe",
    "city": "Kyiv"
}


- Response
```text
"{\"utc_offset\":\"+03:00\",\"timezone\":\"Europe/Kyiv\",\"day_of_week\":5,\"day_of_year\":150,\"datetime\":\"2025-05-30T15:06:41.685179+03:00\",\"utc_datetime\":\"2025-05-30T12:06:41.685179+00:00\",\"unixtime\":1748606801,\"raw_offset\":7200,\"week_number\":22,\"dst\":true,\"abbreviation\":\"EEST\",\"dst_offset\":3600,\"dst_from\":\"2025-03-30T01:00:00+00:00\",\"dst_until\":\"2025-10-26T01:00:00+00:00\",\"client_ip\":\"46.185.74.223\"}"
```

A lot of errors!!!!

### Get report. Method: HTTP-POST, Path: /api/report. 

Simple Rest APi. 
- request
```json
{
  "dts": "2024-01-01",
  "dtf": "2024-01-31",
  "report": "OPERLIST"
}
```

- response

```json

{
    "products": [
        {
            "id": 1,
            "title": "Essence Mascara Lash Princess",
            "description": "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula.",
            "category": "beauty",
            "price": 9.99,
            "discountPercentage": 10.48,
            "rating": 2.56,
            "stock": 99,
            "tags": [
                "beauty",
                "mascara"
            ],
            "brand": "Essence",
            "sku": "BEA-ESS-ESS-001",
            "weight": 4,
            "dimensions": {
                "width": 15.14,
                "height": 13.08,
                "depth": 22.99
            },
            "warrantyInformation": "1 week warranty",
            "shippingInformation": "Ships in 3-5 business days",
            "availabilityStatus": "In Stock",
            "reviews": [
                {
                    "rating": 3,
                    "comment": "Would not recommend!",
                    "date": "2025-04-30T09:41:02.053Z",
                    "reviewerName": "Eleanor Collins",
                    "reviewerEmail": "eleanor.collins@x.dummyjson.com"
                },
                {
                    "rating": 4,
                    "comment": "Very satisfied!",
                    "date": "2025-04-30T09:41:02.053Z",
                    "reviewerName": "Lucas Gordon",
                    "reviewerEmail": "lucas.gordon@x.dummyjson.com"
                },
                {
                    "rating": 5,
                    "comment": "Highly impressed!",
                    "date": "2025-04-30T09:41:02.053Z",
                    "reviewerName": "Eleanor Collins",
                    "reviewerEmail": "eleanor.collins@x.dummyjson.com"
                }
            ],
            "returnPolicy": "No return policy",
            "minimumOrderQuantity": 48,
            "meta": {
                "createdAt": "2025-04-30T09:41:02.053Z",
                "updatedAt": "2025-04-30T09:41:02.053Z",
                "barcode": "5784719087687",
                "qrCode": "https://cdn.dummyjson.com/public/qr-code.png"
            },
            "images": [
                "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp"
            ],
            "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp"
        },
        {
            "id": 2,
            "title": "Eyeshadow Palette with Mirror",
            "description": "The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks. With a built-in mirror, it's convenient for on-the-go makeup application.",
            "category": "beauty",
            "price": 19.99,
            "discountPercentage": 18.19,
            "rating": 2.86,
            "stock": 34,
            "tags": [
                "beauty",
                "eyeshadow"
            ],
            "brand": "Glamour Beauty",
            "sku": "BEA-GLA-EYE-002",
            "weight": 9,
            "dimensions": {
                "width": 9.26,
                "height": 22.47,
                "depth": 27.67
            },
            "warrantyInformation": "1 year warranty",
            "shippingInformation": "Ships in 2 weeks",
            "availabilityStatus": "In Stock",
            "reviews": [
                {
                    "rating": 5,
                    "comment": "Great product!",
                    "date": "2025-04-30T09:41:02.053Z",
                    "reviewerName": "Savannah Gomez",
                    "reviewerEmail": "savannah.gomez@x.dummyjson.com"
                },
                {
                    "rating": 4,
                    "comment": "Awesome product!",
                    "date": "2025-04-30T09:41:02.053Z",
                    "reviewerName": "Christian Perez",
                    "reviewerEmail": "christian.perez@x.dummyjson.com"
                },
                {
                    "rating": 1,
                    "comment": "Poor quality!",
                    "date": "2025-04-30T09:41:02.053Z",
                    "reviewerName": "Nicholas Bailey",
                    "reviewerEmail": "nicholas.bailey@x.dummyjson.com"
                }
            ],
            "returnPolicy": "7 days return policy",
            "minimumOrderQuantity": 20,
            "meta": {
                "createdAt": "2025-04-30T09:41:02.053Z",
                "updatedAt": "2025-04-30T09:41:02.053Z",
                "barcode": "9170275171413",
                "qrCode": "https://cdn.dummyjson.com/public/qr-code.png"
            },
            "images": [
                "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp"
            ],
            "thumbnail": "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp"
        }
    ]
}
```        



### Upload file with form data. Method: HTTP-POST, Path: /api/uplfile. 

- request
Uploads file as  multypart/form-data request, 
- response. 
```json
{"ok":true,"message":"file uploded","fields":[{"fieldname":"formfield1","fieldvalue":"myvalue1"},{"fieldname":"formfield2","fieldvalue":"myvalue2"}],"files":[{"filename":"krisa1.jpg","filemime":"image/jpeg"}]}
```


### Health check. Method: HTTP-GET, Path: /api/health. 

```json
{"ok":true}
```






