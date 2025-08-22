
FROM node:20 AS build

#sets the working directory
WORKDIR /app 
#copy on the package.json and package-lock.json files , so that it doesnt need to do npm isntall step until and unless soemthing changes in this file
COPY package.json package-lock.json ./
RUN npm install

#copying all other files(like the source file and all)
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# this is copying the built app to nginx default path
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off"]