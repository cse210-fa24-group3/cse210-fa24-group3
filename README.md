# DevLog

## Project Overview

DevLog is a developer documentation tool designed to ease documentation tasks for developers, providing a comprehensive platform for document management and collaboration.

## New User Guide

### Getting Started

#### 1. Initial Setup

1. **Create a GitHub Account**
   - If you don't have a GitHub account, [sign up here](https://github.com/signup)

2. **Fork the Repository**
   - Click the "Fork" button at the top right of the repository page
   - This creates a copy of the project in your GitHub account

3. **Clone the Repository**
   ```bash
   # Clone your forked repository
   git clone https://github.com/YOUR-USERNAME/cse210-fa24-group3.git
   
   # Navigate to the project directory
   cd cse210-fa24-group3
   ```

4. **Open the Project**
   - Open the project in your preferred code editor

5. **Install Dependencies**
   ```bash
   # Install project dependencies
   npm install
   ```

6. **Set Up GitHub Credentials**
   - Open the application
   - Navigate to GitHub Credentials section
   - Enter your GitHub username and personal access token

### Repository Navigation Guide

#### Repository Structure
```
cse210-fa24-group3/
│
├── src/                # Source code directory
│   ├── components/     # React components
│   ├── utils/          # Utility functions
│   └── styles/         # CSS and styling
│
├── docs/               # Documentation files
├── tests/              # Test files
├── README.md           # Project documentation
└── package.json        # Project configuration
```

#### Key Directories
- `src/`: Contains the main application code
- `docs/`: Additional documentation
- `tests/`: Contains test files for the project

### Website Navigation

#### Main Dashboard
- Recently Edited Documents
  - View your most recently modified documents
  - Click on any document to open and edit

#### Create New Document
- Click "New Document" button
- Choose from templates:
  1. Bug Review Template
  2. Meeting Notes Template
  3. To-Do List
  4. Feature Specification Template
  5. Journal Entry

#### Theme Switching
- Toggle between light and dark modes
- Located in the top right corner of the interface

#### Document Editor
- **Editing**
  - Type or paste your content
  - Use markdown formatting
  - Utilize AI coding assistance

- **Saving and Committing**
  - Automatic save feature
  - Manual save button
  - Direct GitHub commit option
  - Export to PDF

#### GitHub Integration
- Manage GitHub credentials
- Commit directly from the editor
- Track document versions

## Features
- **GitHub Integration**: Commit goes directly to your repository with the click of a button
- **Minutes of Meeting and Bug Review Templates**
- **AI-Assisted Coding**
- **SRS/Feature Specifications Document Templates**
- **Easy Document Creation and Management**
- **Recently Edited Document Tracking**
- **Automatic Date Tracking**
- **Auto-Save Functionality**
- **Light and Dark Mode Support**

## Technologies Used
- **Frontend**: JavaScript, HTML, CSS
- **Backend**: Node.js, Express.js
- **Database**: SQLite

## Hosting
- Hosted on Google Cloud Platform (GCP), providing reliable and scalable infrastructure

## Links
- [Hosted Site]()
- [Architecture Decision Records (ADRs)](https://github.com/cse210-fa24-group3/cse210-fa24-group3/tree/main/specs/adrs)
- [Project Board](https://github.com/cse210-fa24-group3/cse210-fa24-group3/projects?query=is%3Aopen)
- [CI/CD Pipeline](https://github.com/cse210-fa24-group3/cse210-fa24-group3/blob/main/admin/cipipeline/cicd.md)

## Prerequisites
- Modern web browser
- Git
- GitHub credentials

## Documentation
For detailed API and feature documentation, visit: 
https://cse210-fa24-group3.github.io/cse210-fa24-group3/global.html#TEMPLATE_LINKS

## Contribution Guidelines
1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Support
For issues or questions, [open an issue](https://github.com/cse210-fa24-group3/cse210-fa24-group3/issues)

