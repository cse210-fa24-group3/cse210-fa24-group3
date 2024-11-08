# Git Commit Button For Export

## Status
Accepted

## Context
Our team is developing a journaling tool for developers to store notes, ideas, and project documentation. Currently, all data is stored in Notion's cloud, but Notion’s storage format is inconsistent with other project and versioning records, making it harder to locate and cross-reference information. To improve data accessibility and unify storage methods across projects, we aim to implement a “Git Commit” button, allowing users to export journal entries directly to Git repositories where they can be versioned and integrated with the rest of their codebase.

## Decision
To implement a Git Commit button for exporting to Git, we will create a feature in API using NodeJS and Express that allows users to sync selected entries with their Git repositories. This will add value by providing robust version control, enhancing collaboration, and improving traceability of changes over time.

## Consequences
### Positive:
-	Enables robust version control through Git, allowing users to track changes, create rollbacks, and maintain a detailed history of journal entries.
-	Centralizes storage with Git, ensuring that developer notes, documentation, and code are stored uniformly, simplifying searchability and cross-referencing.
-	Integrates seamlessly with CI/CD workflows, as journals can be treated as part of the codebase and accessed directly through Git.

### Negative:
-	Requires more initial setup and configuration to ensure user authentication and permissions when accessing external Git repositories.
-	Adds maintenance complexity for handling potential merge conflicts, sync issues, or network dependency on Git repositories.

## Related Decisions
None

## Date
2024-11-4

## Authors
- Sneha Pujari
- Aryan Dokania
- Amy Munson
- Venu Chaudhari
- Andrew Choi
- Krithika Iyer
- Keqian Wang