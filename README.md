Create .env file
============================================
including these information:
```
PORT=PORT_NUMBER
LINE_CHANNEL_ID=LINE_CHANNEL_ID
LIEN_CHANNEL_SECRET=LIEN_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN=LINE_CHANNEL_ACCESS_TOKEN
```

Local Build Docker Image and Run
============================================
```
ip addr | grep eth0
docker build . -t learning-line-bot
docker run --env-file .env -p 80:80 --name dev learning-line-bot:latest
```
