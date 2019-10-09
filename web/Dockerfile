FROM node:12.8.1-slim

WORKDIR /usr/src/app

ENV http_proxy http://user:password@hostname:80/
ENV https_proxy http://user:password@hostname:80/
RUN npm -g config set proxy http://user:password@hostname:80/
RUN npm -g config set https-proxy http://user:password@hostname:80/

# https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-in-docker
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install --production

COPY src src
CMD [ "node", "--experimental-modules", "src/server.mjs" ]
