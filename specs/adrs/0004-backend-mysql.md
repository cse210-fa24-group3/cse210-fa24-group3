# MySQL for Backend Framework

## Status
Accepted

## Context
The backend framework for our developer journal will need to efficiently store and retrieve the data for different users. Our team determined that a relational database management system would be more appropriate as it is lightweight, fast, and better for structured data. Our team is also has already worked with SQL.

## Decision
We will use MySQL as the database management system for our web application because of it is lightweight, has structured data, and is familiar to the team.

## Consequences
### Positive
- Faster development due to the team having experience with SQL and MySQL
- Good for structured data and data that references other tables because of its referential integrity
- Provides more safety than the leading non-relational DMS, MongoDB
- Can be scaled vertically and horizontally
- Lightweight and supports query optimization
- The development team has significant experience with SQL and MySQL
- High read throughput

### Negative
- Rigid schema that takes more time and work to change than systems like MongoDB
- Writing to the database may take more time than with MongoDB

## Related Decisions
ADR 0003: Node.js for Backend Framework

## Date
2024-10-27

## Authors
- Sneha Pujari
- Aryan Dokania
- Amy Munson
- Venu Chaudhari
- Andrew Choi
- Krithika Iyer
- Keqian Wang