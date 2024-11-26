# Meeting Notes
## 10/25/2024
- Reviewed assignment document
- Green Field vs Brown Field
    - Sneha thinks green is better, it provides a clean slate and you don't need to learn the existing base. Existing projects have existing problems.
    - Aryan says greenfield
    - Amy thinks green, but we need to be very careful to not overengineer it, which we tend to do
    - Andrew originally thought brownfield since it gives you a starting point, but he agrees there will be a learning curve to the project. Overall, open to both approaches
    - Keqian is open to both
    - Krithika prefers greenfield
    - Venu also votes greenfield since learning a new system is very time consuming
- Final Verdict: Green field
- TA Meeting Recap
    - Using react in the warm up was too much, it’s overengineering. Stick to plain JS
    - The TA wants the big decisions communicated early to him, not just in grading
        - Remember that if we want to use any library or any additional tool, we must consult with Kashish
    - Loved the ADRs, their detail, and the documentation
    - He also liked the CI/CD Pipeline
    - We need to do github workflows
- Next Meeting: Sunday 5pm
    - In person meeting, Aryan will call in
    - Find existing versions of green field examples with links 
        - Developer Focused Journal Tool 
        - Developer Focused Dashboard 
        - Developer Productivity Tool 
    - Keep it simple


## 10/27/2024
- Brainstorming session
    - Adding skills/extracting skills from a project or a question solve on leetcode by the dev
    - Visualization of these things
    - Suggesting workflow for how to go about a project
    - Trello
    - Voice to text - 
    - Simple combination of Notion (Pages, doc, links) + Trello (ticket, organization) + Jira (Roadmap, milestone)
    - Adding projects, make a project timeline, milestone projects, assign points to tickets and milestones -> graphical representations and visualization
    - Section for dev - easter egg features
    - Sticker feature like iOS messages on notes
    - Virtual coding pet like talking tom
        - Rubber duck pet as a rubber duck debugging cameo
        - Gets happier/healthier as you complete tasks
- Questions for TA
    - Will we be allowed to use APIs?
    - Backend?
    - Dashboard confusion
    - Confirm which concepts to stick with - do we have to stick to one? Can we combine all 3?


## 11/2/2024
- Todo for Pitch:
    1. Ideation (Today/Tomorrow)
        - 1st principles - why journaling tools? 
        - Negative thoughts - why would a developer go and write stuff in a journal?
        - Who, what, where, when , why 
    2. Research (Tomorrow)
        - What features can be added to the journaling tool for a developer?
        - What features will facilitate the process of journaling for a developer?
        - Lots of people have done dev focused journaling tools before what is different about this one?
    3. User/System thinking (Tuesday before 1pm)
        - Similar projects/drawn inspiration from (Online) 
            - https://dribbble.com/shots/21114358-Journaling-Mobile-App
            - https://dribbble.com/shots/17505005-Journals-Journaling-App
            - (https://dribbble.com/shots/24632580-Journal-Note-App-Design-Concept)
        - User personas: Andrew Choi
        - User stories: Krithika Iyer
        - UML use case diagram: Andrew Choi
        - Wireframe: Sneha Pujari Aryan Dokania (UI design - each page design)
        - User Flow: (will help us get a flow of the logic): Amy Munson
        - Storyboard: Venu Chaudhari Keqian Wang
    - Steps 1-2 get filled into the chart in the shared document


## 11/11/2024
- Whole Team Meeting
    - Future Meetings
        - Need to do sprint meetings and then a retrospective meeting after each week
        - Wednesday is a good day for sprint meetings for us
        - Maybe it’s possible to do the retrospective the next Wednesday, although ideally it would be Friday-Sunday
        - Meeting times are ironed out in Mattermost
        - 10-10:30am Monday retrospective meetings
        - 4pm Friday Sprint Review Meetings
    - CI/CD Pipeline
        - Need to work and have things up by November 17
        - Andrew and Aryan have experience with CI/CD
        - Want to divide 3 to the pipeline, 4 for Dev
            - CI/CD: Andrew, Aryan, Krithika (documentation)
                - Documentation will also need to do ADRs
            - Dev: Sneha, Amy, Venu, Keqian
        - CI/CD will need its own meeting
    - Code we need set up for the pipeline
        - Need to start the journal before creating the pipeline
        - Try to get the homepage up (at least a skeleton) so they can test it in the pipeline
        - Will require a meeting to split tasks
    - Amy will raise PRs for both meeting notes and ADRs
        - Will also update the meeting notes for today
    - Pipeline diagram meeting on Friday 10am
        - Andrew, Aryan, Krithika, Sneha
        - Ask Kashish for details on this and what is expected
- Dev Team Meeting
    - Dev Task Assignment (Finish by Wednesday Night)
    - Nav Bar – Sneha (+ Keqian)
    - Create new form (Just the basic new journal entry)  – Amy + Venu
        - Frontend (Amy) + backend (Venu)
        - Only keep the last updated time and title, otherwise empty. Samples in the pitch are outdated for the journal entries.
    - Designing the front page according to the Miro Board – Sneha
        - Will try to get the basics done tonight for the pipeline
    - Need to set up the backend and SQLite – Venu
- CI/CD Team Meeting
    - Sprint 1 (Nov 15) Action Items
        - Linting and code style enforcement (may happen in pipeline and/or in editor)
            - Need to research
        - Code quality via human review (ex. pull requests)
        - E2E UI Test via automation (Puppeteer, Mocha/Chai)
        - Diagram (cicd.png: a diagram of your build pipeline)
        - cicd.md: (2-page) Embed your diagram in the markdown file. 
    - Sprint 2 (Nov 22) Planned Tasks
        - Code quality via tool (ex. Codeclimate, Codacy, etc.)
        - Documentation generation via automation (HTML Report)
        - Including e2e (end-to-end) and pixel testing


## 11/15/2024
- Updates
    - Sneha Pujari
        - Working on setting up the frontend (HTML, JS, CSS).
        - Problem: Encountered issues with the saving part.
    - Aryan Dokania
        - Workflow setup completed.
        - Added LinkedIn workflow, deployed workflow, and end-to-end tested it.
        - Implemented branch protection rules.
    - Amy Munson
        - Progress on theme toggle button.
        - Adjusted button sizes and functionality.
    - Andrew
        - Developed code for UI end-to-end tests.
        - Will create additional test cases as work progresses.
    - Keqian Wang
        - Finished the navbar task.
    - Krithika Iyer
        - Completed the basic flow diagram for the CI/CD pipeline.
        - Working on the documentation.
    - Venu Chaudhari
        - Connected the frontend to the backend using SQLite.
        - Problem: Facing issues with saving functionality, expected to resolve soon.
    Pending Tasks from Current Week
    - Sneha: Push changes to editor.js.
    - Andrew: Optional task to work on console color changes.
- Next Week Tasks
    - General Notes
        - For CI/CD: Unit testing is pending and will be worked on progressively.
        - Aryan and Andrew suggested skipping unit tests for now and focusing on code coverage.
        - Aim to generate an HTML report.
    - Task Division – Target: Complete Stage 1 of User Stories
        - Frontend/Backend
            - Saving the File
            - Responsible: Venu Chaudhari & Sneha Pujari
            - Recently Viewed on Homepage
            - Responsible: Venu Chaudhari & Sneha Pujari
            - Integration with backend.
        - Frontend
            - Templates Creation
            - Homepage: Amy Munson
            - Minutes of Meeting: Keqian Wang
            - Bug Review: Amy Munson
            - Feature Specifications: Keqian Wang
            - To-Do: Sneha Pujari
            - Tasks for Each Template:
                - Structure creation.
                - Backend saving functionality.
                - Backend integration.
                - Deletion, updating, saving, and reading functionalities.
        - Backend
            - Tables Setup for Template Saving/Creation
                - Responsible: Krithika Iyer & Sneha Pujari
            - Recently Viewed Functionality
            - Table creation and data entry: Venu Chaudhari & Sneha Pujari


## 11/18/2024
- Attended by: Sneha, Aryan, Venu, and Krithika

- Overview: The document (https://docs.google.com/document/d/1cc-5wbQG7Qk1U0q4Q7K4kKPsSUzM2fPEAb8QGOZ6YU4/edit?tab=t.0) for the Sprint 1 retrospective was shared, and we reviewed the key points together.
    - What Went Well
        - Aryan: Successfully assigned issues to each Pull Request and CI/CD pipeline workflows were established
        - Venu: Editor details were saved correctly in the respective entries.json file
        - Krithika: CI/CD workflow ran smoothly and coordination for setting up both CI/CD and frontend was effective
        - Sneha: CI/CD pipeline workflows were completed. GitHub PRs and issues were aligned well. Basic frontend and backend setup was completed. Good timeline planning, coordination of tasks
        - Amy: Using GitHub Issues and PRs. Implementing the frontend and backend went well
        - Andrew: Initial Web page & CI/CD setup and development was very quick and well-planned
        - Keqian: The tasks assigned were well planned and decided very quickly
    - What Didn’t Go Well
        - Aryan: Some tasks were pending until the last day of the sprint, despite plans to finish earlier
        - Venu: Faced issues with file paths during integration
        - Krithika:  Some tasks were delayed until the last moment
        - Sneha: Timeline was an issue
        - Amy: There was a tight schedule and eneven task distribution
        - Andrew: Deadline for submission was a bit tight
        - Keqian: The whole developing process is not long, so deadline for each task was tight
    - What Could Be Done Better
        - Aryan: Follow proper issue and PR linkage, ensuring alignment with story points, milestones, and PR review requests
        - Venu: Avoid delaying tasks until the last minute and seek iterative feedback from teammates when one is working on a subtask
        - Krithika: Plan tasks better to prevent last-minute delays
        - Sneha: Focus on better estimation and coordination to ensure smoother task progression
        - Amy: More even task distribution and more consistent communication
        - Andrew: Improve on timeline management and completing tasks prior to deadlines will be greatly helpful
        - Keqian: follow the timeline and start early on the tasks, better plan the task with other works
- Further Discussion
    - Break down tasks for each story into smaller, step-wise subtasks for better time estimation and clarity
    - Schedule a post-class meeting with all team members to break down their story points into subtasks to estimate the time it will take
 

## 11/22/2024
- Sprint 2 Review
- Attended by: Amy, Andrew, Aryan, Keqian, Krithika, Sneha, Venu

- Amy:
    - Updated the homepage to include templates and fixed issues with the recently viewed section.
    - Awaited backend PR merge and incorporated backend/recent changes from Sneha.
    - Created a bug review template and prepared it for PR submission.
- Andrew:
    - Updated the UI test cases and corresponding sheets.
    - Worked on generating an HTML report.
- Aryan:
    - Added Code Coverage to the repo
    - working on jsdocs 
- Keqian:
    - Created a template for feature specifications and meeting minutes, aligned with Figma designs.
    - Began working on integrating the templates with backend functionalities.
- Krithika:
    - Designed the ER diagram for the backend.
    - Investigated the use of SQLite for connecting databases, aiming to resolve challenges with local-only access.
- Sneha:
    - Set up the table for "Recently Viewed" and template-saving functionalities.
    - Revamped the homepage and integrated the "Recently Viewed" section with backend logic.
    - Worked on saving files and aligning templates with backend workflows.
- Venu:
    - Implemented backend functionality for the "Recently Viewed" section.
    - Displayed the top three recently viewed documents on the homepage.
    - Planned to work on a separate page for the recently viewed documents.

## 11/23/2024
- Tasks progress + Video check-in discussion
- Attended by: Amy, Andrew, Aryan, Keqian, Krithika, Sneha, Venu

- Updates
    - Major updates done / Page Journal done / Bug review page almost done / Entries -> Documents / Work on Template format / Issues with merging branches / 'Recently added pages' - done
    - Code Coverage test (CodeCov) - fixing issues with setting up the CI run. - FIXED
    - UI Test - html report generation ongoing / Test cases sheet - updating
- Video Demo (< 4 mins)
    - 1 min FE / Pipeline / Testing
    - We need 'some' features working.
        - To-do List, Create new document, Navigation bar
    - Video Talking Points
        - Home page
        - Light/dark mode
        - Create new, fill in and save
        - Recently viewed + edit recent
        - Templates (todo, … )
        - Pipeline review
        - Health of team/Git processes
        - Challenges so far 
        - Preview of next sprint (new templates, hosting backend, light/dark mode fine tuning, etc...)
- Challenges
    - Issues with hosting/no free hosting for the backend that results in issues for the pipeline
    - Merge conflicts - after new features are developed
    - Tight deadlines
    - Connection between front end and backend makes it hard to have members independently work on things that impact each other/share files


## 11/25/2024
- Attended by: Amy, Andrew, Aryan, Keqian, Krithika, Sneha, Venu

- Overview
    - What went well
        - Active Communication
        - Responsibility as an individual contributor
        - Frequent meetings
        - Active communication, participation, and collaboration
        - Coordination between team members
        - Good progress made in completing tasks
        - Planning of tasks was done properly
    - What didn’t go well
        - Code coverage required unit tests, which required last minute work
        - Merge conflicts
        - Different people’s tasks were interwoven, and so progress was slower and harder to coordinate than before
        - Difficulties when developing on a local backend
        - Did not realize some tasks would take more time
    - What could be done better
        - Task creation after proper planning of scope
        - Better planning for tasks that interact
        - Starting deliverables like the video sooner
        - Better planning for the corporation between frontend and backend
        - PR review timeliness 
- Next Tasks
- Add/ Manage Tags: Aryan Dokania
- Light/ Dark Theme: Amy Munson
- Minutes of Meeting Template: Keqian Wang
    - Template structure
    - Integration with backend
    - Deletion
    - Updating
    - Saving/Reading
- Feature Specifications Template: Keqian Wang
    - Template structure 
    - Integration with backend
    - Deletion
    - Updating
    - Saving/Reading
- To-do Template: Sneha Pujari
    - Deletion
- Implement uniform formatting style: Amy Munson
    - Styling across all the pages
    - Logos
    - Fonts
- Integrating and linking all the templates and making sure that all templates are in sync: Sneha Pujari
- UI tests: Andrew Choi
- Hosting DB: Krithika Iyer
- Finalise recently viewed and todo being saved to recently viewed: Venu Chaudhari