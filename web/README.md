# hitomap

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Start API
```
node --experimental-modules src/server.mjs
```

### Start API by Docker
```
docker-compose up -d
```

### Deploy API
Copy Dockerfile, package.json, package-lock.json and src folder to server (/home/neo4j/app) by WinSCP etc.
```
cd /home/neo4j
docker-compose up -d
```

### Deploy service
Copy dist/*  to server (/home/neo4j/volume/web) by WinSCP etc.
