# Usar Node.js LTS específico
FROM node:22.18.0-slim

# Crear directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar archivos de dependencias primero (para cache)
COPY package*.json ./

# Establecer entorno de desarrollo
ENV NODE_ENV=development

# Instalar TODAS las dependencias (incluye nodemon y eslint)
RUN npm install

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto de la app
EXPOSE 3001

# Comando por defecto con hot-reload (nodemon)
CMD ["npx", "nodemon", "src/server.js"]
