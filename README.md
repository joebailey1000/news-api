# Northcoders News API

Welcome to Joey's News API!

This is an API project using Postgres and JavaScript to replicate the 
functionality of an online messageboard with mocked data.

A live hosted version can be found at https://news-api-p73k.onrender.com
- Simply append /path/to/endpoint to the url to access the database.











To use this repo you will need to establish the environment for testing and development databases:

1. Create two .env files into the parent directory, named .env.development and .env.test

2. in .env.development write PGDATABASE=nc_news

3. in .env.test write PGDATABASE=nc_news_test