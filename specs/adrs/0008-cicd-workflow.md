# CI CD Pipeline Workflow Design

## Status
Accepted

## Context
Our team is developing a CI/CD pipeline to automate code validation, deployment, and testing. This pipeline aims to streamline development workflows, ensuring that code quality and functionality are validated at every stage before merging to the main branch. It incorporates multiple workflows, including linting, deployment, end-to-end testing, code quality checks, and report generation.

## Decision
We have designed a CI/CD pipeline workflow that includes the following stages:

1. **Pull Request Creation**: Initiated by the developer.
2. **ESLint Workflow**: Validates code formatting and quality; if successful, it triggers the deployment workflow. A failure sends a notification.
3. **Deployment Workflow**: Deploys the application for testing purposes. Success moves it to the E2E (end-to-end) testing stage.
4. **E2E Testing**: Runs automated end-to-end tests. A failure here triggers a notification. Success proceeds to code quality checks.
5. **Code Quality (Code Coverage)**: Assesses code quality and coverage. Success allows an HTML report to be generated.
6. **HTML Report Generation**: Generates a test and code quality report for visibility.
7. **Merge to Main Branch**: On successful report generation, the code merges to the main branch.
8. **Notifications**: Any failure at any stage sends notifications for prompt attention.

## Consequences
**Positive**:
- **Enhanced Quality Control**: Automates testing and validation steps, catching errors early in the development cycle.
- **Streamlined Deployment**: Each successful stage feeds seamlessly into the next, reducing manual intervention.
- **Improved Feedback**: Notifications for failures ensure timely alerts for quick fixes.

**Negative**:
- **Increased Complexity**: Each additional stage adds to the pipeline's complexity, potentially increasing build times.
- **Dependency on Automation**: A failure in any automated step halts progress, which can be an issue if not handled promptly.

## Related Decisions
None

## Date
2024-11-25

## Authors
- Sneha Pujari
- Aryan Dokania
- Amy Munson
- Venu Chaudhari
- Andrew Choi
- Krithika Iyer
- Keqian Wang
