datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum WorkgroupStatus {
  ACTIVE
  INACTIVE
}

enum MembershipRole {
  PRESIDENT
  SECRETARY
  ASSISTANT
  GUEST
}

enum MeetingType {
  PRESENTIAL
  ONLINE
}

enum TaskMemberRole {
  RESPONSIBLE
  COLLABORATOR
}

model Workgroup {
  id               String          @id @default(uuid())
  name             String          @unique
  description      String?
  status           WorkgroupStatus @default(ACTIVE)
  deactivationDate DateTime?
  
  // Hierarchy
  parentId   String?
  parent     Workgroup? @relation("WorkgroupHierarchy", fields: [parentId], references: [id])
  children   Workgroup[] @relation("WorkgroupHierarchy")

  // Relations
  memberships Membership[]
  meetings    Meeting[]
  tasks       Task[]

  @@index([parentId])
  @@index([name])
}

model Member {
  id               String     @id @default(uuid())
  name             String
  surname          String
  email            String     @unique
  dni              String     @unique
  status           WorkgroupStatus @default(ACTIVE) // Reusing same status enum
  deactivationDate DateTime?
  deactivationDesc String?

  // Phone numbers (stored as JSON)
  phones Json? // Format: [{"type":"mobile","number":"123456"},...]

  // Relations
  memberships Membership[]
  attendances Attendance[]
  taskMembers TaskMember[]

  @@index([email])
  @@index([dni])
}

model Membership {
  id         String         @id @default(uuid())
  role       MembershipRole
  startDate  DateTime
  endDate    DateTime?
  
  // Relations
  workgroupId String
  workgroup   Workgroup @relation(fields: [workgroupId], references: [id])
  memberId    String
  member      Member    @relation(fields: [memberId], references: [id])

  @@unique([workgroupId, memberId])
  @@index([memberId])
  @@index([startDate])
}

model Meeting {
  id          String      @id @default(uuid())
  title       String
  description String?
  date        DateTime
  type        MeetingType
  observations String?
  agenda      String?
  minutes     String?
  
  // Relations
  workgroupId String
  workgroup   Workgroup @relation(fields: [workgroupId], references: [id])
  attendances Attendance[]

  @@index([date])
  @@index([workgroupId])
}

model Attendance {
  id        String   @id @default(uuid())
  
  // Relations
  meetingId String
  meeting   Meeting @relation(fields: [meetingId], references: [id])
  memberId  String
  member    Member  @relation(fields: [memberId], references: [id])

  @@unique([meetingId, memberId])
  @@index([memberId])
}

model Task {
  id          String      @id @default(uuid())
  title       String
  description String?
  deadline    DateTime?
  
  // Relations
  workgroupId     String
  workgroup       Workgroup @relation(fields: [workgroupId], references: [id])
  checkItems      CheckItem[]
  taskMembers     TaskMember[]
  templateId      String?
  taskTemplate    TaskTemplate? @relation(fields: [templateId], references: [id])

  @@index([workgroupId])
  @@index([deadline])
}

model TaskTemplate {
  id          String      @id @default(uuid())
  title       String
  description String?
  items       TemplateItem[]
}

model TemplateItem {
  id             String      @id @default(uuid())
  title          String
  taskTemplateId String
  taskTemplate   TaskTemplate @relation(fields: [taskTemplateId], references: [id])
}

model CheckItem {
  id      String   @id @default(uuid())
  title   String
  isDone  Boolean  @default(false)
  
  taskId  String
  task    Task     @relation(fields: [taskId], references: [id])
}

model TaskMember {
  id      String        @id @default(uuid())
  role    TaskMemberRole
  
  // Relations
  taskId   String
  task     Task   @relation(fields: [taskId], references: [id])
  memberId String
  member   Member @relation(fields: [memberId], references: [id])

  @@unique([taskId, memberId])
  @@index([memberId])
}
