@echo off

REM Stop and remove the container (if it exists)
docker stop foloosi-blogs && docker rm foloosi-blogs

REM Remove the image (if it exists)
docker rmi foloosi/node-blog-app

REM Build the image
docker build . -t foloosi/node-blog-app

REM Run the container
docker run -p 4001:3001 -d --name foloosi-blogs foloosi/node-blog-app 
