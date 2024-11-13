# Node.js and Express for API Framework

## Status
Accepted

## Context
Our team is building a developer journal that must handle client-server communication through an API framework. This framework must be lightweight and able to handle multiple users sending concurrent requests. Our team is already familiar with NodeJS, and the journal's frontend is being implemented with vanilla JavaScript. The backend uses NodeJS and MySQL, and so the API framework should integrate well with the rest of the tech stack. 

## Decision
We decided to use NodeJS and Express for the developer journal's API framework. We are already using NodeJS for the backend of the application, and Express is compantible with NodeJS. Express also provides the tools to easily handle APIs.

## Consequences
### Positive
- Lightweight and flexible tools
- Provides some scalability
- Less time learning the tools since the team already has experience with JavaScript and NodeJS
- Both have good documentation and developer support

### Negative
- Risk of NodeJS and Express becoming unsupported over time
- Potential bottlenecks and scalability issues for complex workloads with NodeJS
- The NodeJS single-threaded model may struggle with tasks that require heavy computation

## Related Decisions
ADR 0003: Node.js for Backend Framework

## Date
2024-11-5

## Authors
- Sneha Pujari
- Aryan Dokania
- Amy Munson
- Venu Chaudhari
- Andrew Choi
- Krithika Iyer
- Keqian Wang
