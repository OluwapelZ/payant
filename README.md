# Sample play around Micro Service

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
###### First run [Or when you modify docker-compose file]
```
docker-compose up --build
```
###### On subsequent runs
```
docker-compose up
```

### Database Actions
Database migration, rollback and seeding action commands

##### Run Migrations
```
npm run migrate
```

##### Rollback Migrations
```

npm run rollback
```
