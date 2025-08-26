## Ejecutar docker

docker build -t auth-microservice .
docker run -d --name auth-service -p 3000:3000 \
 --env-file .env \
 auth-microservice
