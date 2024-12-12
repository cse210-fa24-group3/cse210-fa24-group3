# Deploy Website Through Netlify

## Status
Accepted

## Context
Our developer journaling web application requires a simple, efficient, and reliable deployment solution. We need a platform that can handle static website hosting, continuous integration/continuous deployment (CI/CD), and basic performance optimization.

## Decision
We will deploy the web application on Netlify. Netlify is a cloud-based platform that simplifies the process of building, deploying, and hosting web applications. By leveraging Netlify's features, we can streamline our deployment workflow and ensure a seamless user experience.

## Consequences
### Positive:
-	Netlify offers a user-friendly interface and automated deployment pipelines, reducing manual effort and increasing efficiency.
-	Netlify's global Content Delivery Network (CDN) ensures fast load times for users worldwide. It integrated CI/CD capabilities allow for automatic builds and deployments on code changes.
-	Tools for optimizing website performance, such as image optimization and code minification.

### Negative:
-	It has limited Customization, the configuration options may be less extensive than those offered by full-fledged cloud platforms like GCP.
-	As the website scales, potential cost may increase, especially for advanced features like serverless functions.


## Related Decisions
None

## Date
2024-11-20

## Authors
- Sneha Pujari
- Aryan Dokania
- Amy Munson
- Venu Chaudhari
- Andrew Choi
- Krithika Iyer
- Keqian Wang