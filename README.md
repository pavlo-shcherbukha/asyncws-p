# Project asyncws - Prototype async web service with Node.js Node-Red and Rabbit MQ


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
All necessary containers and environment variables are gathered on docker-compose file **docker-compose-nr.yaml**.

1. Change environment variables according to your configurations
Put is this variables parameters of your repository which wiil be cloned during docker build phase. In the same time it allow you enter into container and push your changes back to github repository.  Then **GIT_PSW** argument means github token which is using for https connection to github.



```yaml
  red-sender:
    # 1===
    #image: nodered/node-red
    #container_name: redsender
    build:
      context: ./
      dockerfile: nodered.dockerfile 
      args:
        GIT_USER: github username
        GIT_PSW: github token
        GIT_BRANCH: brnach name
        GIT_REPO:  githyb url without "https://"
        GIT_EMAIL: "your email"  for git config global

```

You can explicitly set up flow file which your want to run  by set up the environment variable **FLOWS**

```yaml

    environment:
      RABBITMQ_USER: "user"
      RABBITMQ_PASSWORD: "****"
      RABBITMQ_HOST: "rabbitmq"
      RABBITMQ_PORT: "5672"      
      FLOWS: "uploader.json"    
```

2. Build and run compose


```bash
    docker-compose -f  docker-compose.yml up --remove-orphans --force-recreate --build -d

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

4. Start has already builded co
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



##  api-srvc Web API Description

### Report API
This api is aimed to show a simple async web api through rabbitMQ.

#### Get report.
- path: /api/report
- method: http-post
- request body

```json
    {
        "dts": "2024-01-01",
        "dtf": "2024-01-31",
        "report": "OPERLIST"
    }
```
- dts - begin date, date format "YYYY-MM-DD";
- dtf - end date, date format "YYYY-MM-DD";
- report - report code (report id). Allowed values: "OPERLIST", "PRODUCTLIST", "CUSTOMERLIST"


