# Node.js for Backend Framework

## Status
Accepted

## Context
The backend framework for our developer journal needs a backend tech stack that supports the journal's functionality and is easy for our team to learn if they are unfamiliar with it. Our development team already has experience modern JavaScript frameworks, including React and Node.js, and so the team would spend less time learning how to use Node.js. 

## Decision
We will use Node.js for the backend of the development journal, as we need to support a fast and scalable web server while not needing to learn new, complicated tools. 

## Consequences
### Positive
- Lightweight
- Provides scalability and efficiency 
- The team's familiarity with JavaScript it allows less time to be spent learning Node.js than other tools
- Supports common functionalities like authentication, database integration, and web sockets

### Negative
- Must be careful to avoid overcomplicating the code and overengineering
- Single-threaded model, may struggle with tasks that require heavy computation or data processing quickly
- Relies on callbacks that can become complicated
- Important to be careful of memory leaks

## Related Decisions
ADR 0004: MySQL for Backend Framework

## Date
2024-11-02

## Authors
- Sneha Pujari
- Aryan Dokania
- Amy Munson
- Venu Chaudhari
- Andrew Choi
- Krithika Iyer
- Keqian Wang
