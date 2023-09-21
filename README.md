## welness_cources_be

A brief description of the project and its objectives.

## Roadmap
- ~~auth flow~~
- ~~users with routes, user avatars~~
- ~~groups with routes~~
- ~~posts in groups with routes, videos in posts~~
- notifications / reminders with cron jobs
- comments in posts

## Getting Started

### Prerequisites

1. Copy the `.env.example` file and rename it to `.env`. Fill in the required configurations in the `.env` file based on your setup.
```
cp .env.example .env
```


### Installation

2. Start the Docker containers using the following command:

```
docker-compose up -d
```

This will allow you to deploy the necessary dependencies and create containers for your project.

3. Install project dependencies using Yarn:

```
yarn install
```

### Running Migrations

4. Run migrations to set up the database:

```
yarn migration:run
```

This will populate the database with test data.

### Running the Project

5. Start the project in development mode:

```
yarn start:dev
```

The project will be accessible at `http://localhost:PORT`, where `PORT` is the port specified in your `.env` file.

## Docs & API routes 
- Docs - http://{DOMAIN}:PORT/docs
- API - http://{DOMAIN}:PORT/api