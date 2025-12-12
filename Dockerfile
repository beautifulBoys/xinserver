FROM node:18.19.1-alpine
LABEL name="xinserver"

WORKDIR /app
COPY . .

# RUN npm config set registry https://registry.npmmirror.com/
# RUN npm install --omit=dev

EXPOSE 80

CMD [ "npm", "run", "start" ]
