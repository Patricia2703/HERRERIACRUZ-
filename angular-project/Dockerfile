# Etapa 1: Compilación de Angular
FROM node:18-alpine AS build
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos todo el código fuente del frontend
COPY . .

# 🛠️ Corrección de permisos crítica para que Linux no bloquee el comando 'ng'
RUN chmod -R +x node_modules/.bin

# Compilamos el proyecto para producción
RUN npx ng build --configuration=production

# Etapa 2: Servidor Web Nginx para servir los archivos estáticos
FROM nginx:alpine
# Copiamos los archivos compilados de Angular al directorio de Nginx
COPY --from=build /app/dist/angular-project/browser /usr/share/nginx/html
# Expone el puerto 80 para la web
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]