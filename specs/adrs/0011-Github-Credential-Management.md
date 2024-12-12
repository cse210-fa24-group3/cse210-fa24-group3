# GitHub Integration for Activity Tracking and File Saving

## Status
Accepted

## Context
Our developer journaling tool designed to retrieve GitHub activity data and synchronize application templates directly to GitHub repositories. In the main page, after getting the credential of Github from the user, it will visualize their commit activity tracking board. For the templated journals, after getting github credential from the user, they can upload the journal to Github. This integration will enhance developer productivity by providing a centralized platform for tracking coding activities and managing project templates.

## Decision
We implement a GitHub integration using SSH key with enhanced security measures. The solution will allow users to authenticate via the key, retrieve commit activity, and synchronize templates directly to GitHub repositories. The implementation will prioritize security through token encryption, strict scope management, and comprehensive error handling.


## Consequences
### Positive:
-	Access through SSH key can Fine-grained repository access, easily revocable, and supports multiple scopes
-	Git authentication works through standard authentication flow. It has User-controlled access which supports commit visualization and user repositories push.

### Negative:
-	Requires developer account configuration so the SSH provided to the web app has the potential security risks if exposed, 
-   More requires more user interaction, more complex setup


## Related Decisions
* ADR 0005: Git Commit Button For Export

## Date
2024-11-28

## Authors
- Sneha Pujari
- Aryan Dokania
- Amy Munson
- Venu Chaudhari
- Andrew Choi
- Krithika Iyer
- Keqian Wang