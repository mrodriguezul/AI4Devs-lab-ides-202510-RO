# USER PROMPT 1

## role

You are an expert full-stack developer using React, NodeJS and PostgreSQL

## action

Plan the activities to complete the user requirement step by step

## limits

Use and follow the current project structure.

## context

The team leader assigned me this project structure to complete this particular requirement for a small presentation.
I need to complete all the details and also create the database structure for this particular requirement, and load some test data.
The user requirements' details are:

Add Candidate to the System
As a recruiter, I want to be able to add candidates to the ATS system so I can efficiently manage their data and selection processes.

Acceptance Criteria:

- Function Accessibility: There must be a clearly visible button or link to add a new candidate from the recruiter dashboard's main page.
- Data Entry Form: When selecting the "Add Candidate" option, a form must appear that includes the necessary fields to capture the candidate's information, such as first name, last name, email address, phone number, address, education, and work experience.
- Data Validation: The form must validate the entered data to ensure it is complete and correct. For example, the email address must be in a valid format, and required fields must not be left blank.
- Document Upload: The recruiter must have the option to upload the candidate's CV in PDF or DOCX format.
- Addition Confirmation: Once the form is completed and the information submitted, a confirmation message must appear indicating that the candidate has been successfully added to the system.
- Error and exception handling: In case of an error (e.g., a connection failure with the server), the system must display an appropriate message to the user to inform them of the problem.
- Accessibility and compatibility: The functionality must be accessible and compatible with different devices and web browsers.

Notes:

- The interface should be intuitive and easy to use to minimise the training time required for new recruiters.
- Consider integrating autocomplete functionality for the education and work experience fields, based on pre-existing data in the system.

Technical Tasks:

- Implement the user interface for the candidate addition form.
- Develop the necessary backend to process the information entered in the form.
- Ensure the security and privacy of candidate data.
Do you understand?
Before you do that, ask me all the questions that you need to know to clarify the idea.

## USER PROMPT 2

1: Just the candidate fields that the requirement mentions
2: just degree, institution and graduation year.
3: Just company name, position, start/end dates and description
4: the files should be stored in a filesystem, for example: D:\tmp\ats-files
5: yes
6: It doesn't exist, create a basic one related to candidates
7: Use a single page for now
8: Yes, we will use JWT, not now
9: Use the API Standard Structure
10: Just 10, should be enough
11: Yes
12: Yes

## USER PROMPT 3

Yes, show me the results after you finish one task and wait for my confirmation to continue to the next one.

## USER PROMPT 4

generate all the tasks (completed and incompleted) in a *.md file and save it in the root of the project, directory "tasks"

## USER PROMPT 5 (in cursor)

@task-summary.md @project-tasks.md We couldn't complete the project due to database connection from the backend, I need you to help to solve this Issue.

## USER PROMPT 6

Review the project and give a brief of the status
Explain me what chanches are to keep the app working since the last time we had an issue with the database connection (backend to docker database)
start the app to test all te API Urls.

## USER PROMPT 7

## USER PROMPT 8

## USER PROMPT 9

## USER PROMPT 10