# pg-er-diagram

## Purpose

This project generates an Entity Relationship (ER) diagram for a PostgreSQL database, helping visualize table relationships for DAO Proposal Governance.

## Dependencies
- TypeScript (Node.js)
- `pg` (PostgreSQL client for Node.js)
- `dotenv` (environment variable management)
- `dbml2svg` (for converting DBML to SVG)
- Docker (for containerized environment)

## Installation

Read the dependencies from `package.json` to ensure you install the correct versions. Install all dependencies with:

```bash
npm install
```

## Run Script
1. Make sure to have all the containers running and .env.local properly configured. See .env.example for reference.
2. 
```bash
docker build -t pg-schema-export .
```
1. 
```bash
docker run --rm   --network fincube23_network   -v $PWD:/app   pg-schema-export                                         
```
Here PWD is the mount path