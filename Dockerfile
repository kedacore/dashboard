FROM node:lts-alpine as build-env

COPY . /src
WORKDIR /src
RUN yarn install && yarn build && \
    mv server/dist dist && \
    cp server/package.json dist && \
    cd dist && yarn install --prod && cd .. && \
    mv client/build dist/public && \
    mv dist /app

FROM node:lts-alpine as final
COPY --from=build-env [ "/app", "/app" ]
ENV PORT=80

CMD [ "node", "/app/server.js", "--production" ]
