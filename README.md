# Migo Micro Service

### This micro service is provider specific```

It's a standalone service to point to migo's loans status third party endpoint

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
Build migo image
```
docker build -t migo .
```

Run the container in detached mode (optional)
```
docker run -p 8082:3000 -d <image_name>
```