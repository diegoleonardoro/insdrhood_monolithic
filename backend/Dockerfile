FROM node:alpine
WORKDIR /app
COPY package.json .
RUN npm install 
#copy everything to the /app dir 
COPY . .
CMD ["npm", "start"]