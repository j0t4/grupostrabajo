Create a Prisma schema for a workgroup management system.

The system should include the following models and relationships:

Workgroup: A Workgroup has a name, an optional description, a status (active or inactive), and an optional deactivation date. It can have a parent Workgroup and multiple child Workgroups to represent a hierarchy. A Workgroup has members and holds meetings and tasks.

Member: A Member has personal information like name, surname, email (unique), and DNI (unique). They can have up to three phone numbers with descriptions. A Member has a status (active or inactive) and optional deactivation date and description. They are related to Workgroups through memberships can attend meetings and have a roll in tasks.

Membership: A Membership is a join table that connects a Member and a Workgroup. It defines the member's role (President, Secretary, Assistant, or Guest) and the start and end dates of the membership.

Meeting: A Meeting belongs to a Workgroup. It has a title, optional description, date, and a type (presential or online). It can also have optional observations, an agenda, and minutes. Attendees are linked through an Attendance join table.

Attendance: An Attendance links a Member to a Meeting.

Task: A Task is an activity assigned to a Workgroup. It has a title, an optional description, and an optional deadline date. It is related to CheckItems and TaskMembers. A Task can also be created from a TaskTemplate.

TaskTemplate: A TaskTemplate is a blueprint for a Task. It has a title, an optional description, TaskTemplate don't belongs to a Workgroup. It is related to TemplateItems, which are the individual steps of the template.

CheckItem: A CheckItem is a part of a Task. It has a title and a boolean field to track if it's done.

TaskMember: A TaskMember is a join table that links a Task to a Member. It defines the member's role for the task: either responsible or collaborator.

Make sure to include appropriate @id, @default, @unique, @relation, and @@index annotations to properly define the relationships and ensure data integrity. Also, define enums for the different statuses, roles, and types.

Make sure @id`s are  autoincremental Ints, and database is local SQLite.
