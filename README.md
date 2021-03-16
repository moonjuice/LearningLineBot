Create .env file in shared directory
============================================
including these information:
```
PORT=80
LINE_CHANNEL_ID=LINE_CHANNEL_ID
LIEN_CHANNEL_SECRET=LIEN_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN=LINE_CHANNEL_ACCESS_TOKEN
```

Run Docker on Local Device
============================================
```
// get the ip addr of WSL2
$ ip addr | grep eth0
// run npm install and npm start
$ docker run -it --rm --name learning-line-bot -v "$PWD"/app:/usr/src/app -w /usr/src/app -p 10083:80 node:14 /bin/bash -c "npm install && npm start"
```

Build Docker Image and Run
============================================
```
// build image
$ docker build ./app -t learning-line-bot
// run docker image
$ docker run --rm --env-file ./app/data/.env -p 10083:80 --name dev learning-line-bot:latest
```

Build Qnap App For Port Forwarding
============================================
```
// in the root path
$ docker run -it --rm -v ${PWD}/qpkg:/src dorowu/qdk2-build
```