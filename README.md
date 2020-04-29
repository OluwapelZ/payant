# Payant Micro Service

### This micro service is provider specific

It's a standalone service to point to payant's third party endpoint

### Setup

### Without Docker
```
npm install
```

### Run Test
```
npm test
```

### Start App
```
npm run dev
```

### With Docker
Build payant image
```
docker build -t payant .
```

Run the container in detached mode (optional)
```
docker run -p 8082:8080 -d payant
```