# Northcoders News API

Welcome to Joey's News API!

This is an API project using Postgres and JavaScript to replicate the functionality of an online messageboard with mocked data.

A live hosted version can be found at https://news-api-p73k.onrender.com
- Append /path/to/endpoint to the url to access the database.

To run the server locally there is some setup for dependencies and environments. You will need to do the following:

- Navigate to the directory where the server will be stored.

- Clone the repo:
    - git clone https://github.com/joebailey1000/news-api

- Install the necessary dependencies with either npm or yarn:
    - express
    - pg
    - dotenv
    - pg-format

- These are the dependencies for the test suite:
    - jest
    - jest-sorted
    - supertest

- Establish the node environments - cd into the repo and execute the following:
    - echo PGDATABASE=nc_news >> .env.development
    - echo PGDATABASE=nc_news_test >> .env.test

- Setup and seed the database:
    - npm run setup-dbs
    - npm run seed

Once this is complete the server will be ready for local use or further development. The server uses the following commands:
- npm run start - instructs the server to listen on port 9090
- npm test app - executes the test suite for endpoints
- npm test utils - executes the test suite for utility functions

This project uses node v20.5.1 and PostgreSQL 15.4. Earlier versions may result in unexpected problems.