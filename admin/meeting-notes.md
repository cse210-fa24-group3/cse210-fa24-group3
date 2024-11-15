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
