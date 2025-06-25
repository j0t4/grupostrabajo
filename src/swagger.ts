// src/swagger.ts

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Project API Documentation',
    version: '1.0.0',
    description: 'API documentation for the project managing workgroups, members, meetings, etc.',
  },
  servers: [
    {
      url: '/api',
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      // --- Enums ---
      // (Enums remain the same)
      WorkgroupStatus: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], description: 'Status of the workgroup' },
      MemberStatus: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], description: 'Status of the member' },
      // MembershipRole: { type: 'string', enum: ['PRESIDENT', 'SECRETARY', 'ASSISTANT', 'GUEST'], description: 'Role within a membership' }, // Membership role seems to have been removed from the model
      MeetingType: { type: 'string', enum: ['PRESENTIAL', 'ONLINE'], description: 'Type of the meeting' },
      LogbookEntryType: { type: 'string', enum: ['ATTENDEES', 'AGENDA', 'DOCUMENTATION', 'MINUTES'], description: 'Type of logbook entry' },
      LogbookEntryStatus: { type: 'string', enum: ['ACTIVE', 'RESOLVED'], description: 'Status of logbook entry' },

      // --- Models ---
      Workgroup: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { $ref: '#/components/schemas/WorkgroupStatus' },
          creationDate: { type: 'string', format: 'date-time', readOnly: true }, // Added creationDate
          dissolutionDate: { type: 'string', format: 'date-time', nullable: true }, // Renamed from deactivationDate
          parentId: { type: 'integer', nullable: true },
          coordinatorId: { type: 'integer', nullable: true }, // Added coordinatorId
          // Related fields omitted for brevity, included in specific responses where needed
        },
        required: ['name'], // status, creationDate often set by default
      },
      WorkgroupInput: { // Schema for POST/PUT requests
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { $ref: '#/components/schemas/WorkgroupStatus' },
          dissolutionDate: { type: 'string', format: 'date-time', nullable: true },
          parentId: { type: 'integer', nullable: true },
          coordinatorId: { type: 'integer', nullable: true },
        },
        required: ['name'],
      },
      Member: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          startDate: { type: 'string', format: 'date-time', readOnly: true }, // Added startDate
          endDate: { type: 'string', format: 'date-time', nullable: true }, // Added endDate (replaced status/deactivation)
           // Assuming other fields like surname, dni etc. were removed based on models
           // Add them back if they still exist in the Prisma schema
        },
        required: ['name', 'email'],
      },
       MemberInput: { // Schema for POST/PUT requests
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          endDate: { type: 'string', format: 'date-time', nullable: true },
           // Add other fields if they exist
        },
        required: ['name', 'email'],
      },
      Membership: { // Updated Schema
        type: 'object',
        properties: {
          memberId: { type: 'integer' },
          workgroupId: { type: 'integer' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time', nullable: true },
          // Included related objects as seen in GET responses
          member: { $ref: '#/components/schemas/Member', readOnly: true },
          workgroup: { $ref: '#/components/schemas/Workgroup', readOnly: true },
        },
        required: ['memberId', 'workgroupId', 'startDate', 'member', 'workgroup'], //endDate is nullable
      },
       MembershipPOSTInput: { // New Schema for POST request body
        type: 'object',
        properties: {
          memberId: { type: 'integer', description: "ID of the member" },
          workgroupId: { type: 'integer', description: "ID of the workgroup" },
          startDate: { type: 'string', format: 'date-time', description: "Start date (ISO 8601 format)" },
          endDate: { type: 'string', format: 'date-time', nullable: true, description: "Optional end date (ISO 8601 format)" },
        },
        required: ['memberId', 'workgroupId', 'startDate'],
      },
       MembershipEndDateInput: { // Updated Schema for PUT request body
        type: 'object',
        properties: {
           // Keys (memberId, workgroupId, startDate) are in path, not body
           endDate: { type: 'string', format: 'date-time', nullable: true, description: "End date (ISO 8601 format) or null to remove it" },
        },
        required: [], // endDate can be null
      },
      Meeting: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          workgroupId: { type: 'integer' },
          date: { type: 'string', format: 'date-time' },
           // Include related objects if needed
           workgroup: { $ref: '#/components/schemas/Workgroup', readOnly: true, nullable: true },
           // Removed other fields like title, description etc. assuming simplification
           // Add them back if they exist in the Prisma schema
        },
        required: ['workgroupId', 'date'],
      },
       MeetingInput: { // Schema for POST/PUT requests
        type: 'object',
        properties: {
          workgroupId: { type: 'integer' },
          date: { type: 'string', format: 'date-time' },
          // Add other fields if they exist
        },
        required: ['workgroupId', 'date'],
      },
      Attendance: { // Updated Schema
        type: 'object',
        properties: {
          memberId: { type: 'integer' },
          meetingId: { type: 'integer' },
          present: { type: 'boolean' }, // Added field
          justification: { type: 'string', nullable: true }, // Added field
          // Included related objects as seen in GET responses
          member: { $ref: '#/components/schemas/Member', readOnly: true },
          meeting: { $ref: '#/components/schemas/Meeting', readOnly: true },
        },
        required: ['memberId', 'meetingId', 'present', 'member', 'meeting'], // justification is nullable
      },
       AttendancePOSTInput: { // New Schema for POST request body
        type: 'object',
        properties: {
          memberId: { type: 'integer' },
          meetingId: { type: 'integer' },
          present: { type: 'boolean', default: true }, // Assuming present defaults to true on creation
          justification: { type: 'string', nullable: true },
        },
        required: ['memberId', 'meetingId'],
      },
      LogbookEntry: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          workgroupId: { type: 'integer' },
          date: { type: 'string', format: 'date-time' }, // readOnly on update? Set on creation.
          description: { type: 'string' },
          // Assuming type/status were removed
           // Include related objects if needed
           workgroup: { $ref: '#/components/schemas/Workgroup', readOnly: true, nullable: true },
        },
        required: ['workgroupId', 'description', 'date'],
      },
       LogbookEntryInput: { // Schema for POST/PUT requests
        type: 'object',
        properties: {
          workgroupId: { type: 'integer' },
          description: { type: 'string' },
          // Assuming date defaults to now() on create
        },
        required: ['workgroupId', 'description'],
      },
      ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', nullable: true }, // Consistent message or error property
            error: { type: 'string', nullable: true },
            details: { type: 'array', items: { type: 'object' }, nullable: true, description: "Details for validation errors" } // Added details for Zod errors
          },
      }
    },
    // --- Parameters (for composite keys and IDs) ---
    parameters: {
        IdParam: { name: 'id', in: 'path', required: true, description: 'ID of the resource', schema: { type: 'integer' } },
        // Composite Key Params for URL segments
        AttendanceKeyParam: {
            name: 'memberId_meetingId',
            in: 'path',
            required: true,
            description: 'Composite key for Attendance: {memberId}_{meetingId}',
            schema: { type: 'string', pattern: '^\d+_\d+$', example: '1_101' },
            style: 'simple', explode: false,
        },
         MembershipKeyParam: {
            name: 'memberId_workgroupId_startDate',
            in: 'path',
            required: true,
            description: 'Composite key for Membership: {memberId}_{workgroupId}_{isoStartDate}',
            schema: { type: 'string', pattern: '^\d+_\d+_\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$', example: '1_10_2023-01-01T00:00:00.000Z' },
            style: 'simple', explode: false,
        },
    },
     // --- Responses (common ones) ---
    responses: {
        NotFound: {
            description: 'Resource not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
        },
        BadRequest: {
            description: 'Invalid input data, malformed request, or invalid path parameter format',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
        },
         Unauthorized: {
            description: 'Unauthorized access',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
        },
        InternalServerError: {
            description: 'Internal server error',
             content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
        },
        Conflict: { // e.g., trying to create resource that already exists or FK constraint violation
           description: 'Conflict processing request (e.g., resource already exists, foreign key violation)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
        },
         NoContent: {
            description: 'Operation successful, no content returned (e.g., DELETE)',
         }
    }
  },
  paths: {
    // --- Workgroups (Assuming no changes) ---
    '/workgroups': {
      get: {
        summary: 'List all workgroups',
        tags: ['Workgroups'],
        responses: {
          '200': { description: 'A list of workgroups', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Workgroup' } } } } },
          '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
      post: {
        summary: 'Create a new workgroup',
        tags: ['Workgroups'],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkgroupInput' } } } },
        responses: {
          '201': { description: 'Workgroup created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Workgroup' } } } },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
    },
    '/workgroups/{id}': {
       parameters: [ { $ref: '#/components/parameters/IdParam' } ],
      get: {
        summary: 'Get a workgroup by ID',
        tags: ['Workgroups'],
        responses: {
          '200': { description: 'Workgroup details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Workgroup' } } } },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
      put: {
        summary: 'Update a workgroup by ID',
        tags: ['Workgroups'],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkgroupInput' } } } },
        responses: {
          '200': { description: 'Workgroup updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Workgroup' } } } },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
      delete: {
        summary: 'Delete a workgroup by ID',
        tags: ['Workgroups'],
        responses: {
          '204': { $ref: '#/components/responses/NoContent' },
          '404': { $ref: '#/components/responses/NotFound' },
           '409': { $ref: '#/components/responses/Conflict' }, // Can fail due to FK constraints
          '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
    },

    // --- Members (Assuming no changes, except perhaps FK conflicts on DELETE) ---
     '/members': {
      get: {
        summary: 'List all members',
        tags: ['Members'],
        responses: {
          '200': { description: 'A list of members', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Member' } } } } },
          '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
      post: {
        summary: 'Create a new member',
        tags: ['Members'],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MemberInput' } } } },
        responses: {
          '201': { description: 'Member created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Member' } } } },
           '400': { $ref: '#/components/responses/BadRequest' },
           '409': { $ref: '#/components/responses/Conflict' }, // Unique constraint (e.g., email)
           '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
    },
     '/members/{id}': {
         parameters: [ { $ref: '#/components/parameters/IdParam' } ],
        get: {
            summary: 'Get a member by ID',
            tags: ['Members'],
            responses: {
            '200': { description: 'Member details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Member' } } } },
             '404': { $ref: '#/components/responses/NotFound' },
             '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        put: {
            summary: 'Update a member by ID',
            tags: ['Members'],
            requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MemberInput' } } } },
            responses: {
            '200': { description: 'Member updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Member' } } } },
             '400': { $ref: '#/components/responses/BadRequest' },
             '409': { $ref: '#/components/responses/Conflict' }, // Unique constraint (e.g., email)
             '404': { $ref: '#/components/responses/NotFound' },
             '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        delete: {
            summary: 'Delete a member by ID',
            tags: ['Members'],
            responses: {
             '204': { $ref: '#/components/responses/NoContent' },
             '404': { $ref: '#/components/responses/NotFound' },
             '409': { $ref: '#/components/responses/Conflict' }, // Can fail due to FK constraints (e.g., memberships)
             '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
     },

     // --- Memberships (Updated) ---
     '/memberships': {
        get: { // Assuming the simple GET all implementation
            summary: 'List all memberships',
            tags: ['Memberships'],
            // Removed filtering parameters as route was simplified
            responses: {
                '200': { description: 'A list of memberships', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Membership' } } } } },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        post: { // Updated POST
            summary: 'Create a new membership',
            tags: ['Memberships'],
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { $ref: '#/components/schemas/MembershipPOSTInput' } } } // Use new input schema
            },
            responses: { // Updated responses
                '201': { description: 'Membership created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Membership' } } } },
                 '400': { $ref: '#/components/responses/BadRequest' }, // Invalid input data
                 '409': { $ref: '#/components/responses/Conflict' }, // If composite PK already exists or FK constraint fails
                 '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
     },
      // Updated path using composite key parameter
     '/memberships/{memberId_workgroupId_startDate}': {
         parameters: [ { $ref: '#/components/parameters/MembershipKeyParam' } ], // Use defined composite key param
        get: { // Updated GET by key
            summary: 'Get a specific membership by its composite key',
            tags: ['Memberships'],
            responses: { // Updated responses
                '200': { description: 'Membership details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Membership' } } } }, // Use updated schema
                 '400': { $ref: '#/components/responses/BadRequest' }, // Invalid key format
                 '404': { $ref: '#/components/responses/NotFound' },
                 '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        put: { // Updated PUT by key
            summary: 'Update an existing membership (only endDate)',
             tags: ['Memberships'],
             requestBody: {
                 required: true,
                 content: { 'application/json': { schema: { $ref: '#/components/schemas/MembershipEndDateInput' } } } // Use new input schema
             },
             responses: { // Updated responses
                 '200': { description: 'Membership updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Membership' } } } }, // Use updated schema
                 '400': { $ref: '#/components/responses/BadRequest' }, // Invalid key format or invalid body data (endDate)
                 '404': { $ref: '#/components/responses/NotFound' },
                 '500': { $ref: '#/components/responses/InternalServerError' }
             }
        },
        delete: { // Updated DELETE by key
            summary: 'Delete a specific membership by its composite key',
            tags: ['Memberships'],
            responses: { // Updated responses
                 '204': { $ref: '#/components/responses/NoContent' },
                 '400': { $ref: '#/components/responses/BadRequest' }, // Invalid key format
                 '404': { $ref: '#/components/responses/NotFound' },
                 '409': { $ref: '#/components/responses/Conflict' }, // FK constraint violation
                 '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
     },

    // --- Meetings (Assuming no major changes, add FK conflict on DELETE) ---
     '/meetings': {
      get: {
        summary: 'List all meetings',
        tags: ['Meetings'],
         parameters: [ { name: 'workgroupId', in: 'query', required: false, description: 'Filter meetings by Workgroup ID', schema: { type: 'integer' } } ],
        responses: {
          '200': { description: 'A list of meetings', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Meeting' } } } } },
          '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
      post: {
        summary: 'Create a new meeting',
        tags: ['Meetings'],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MeetingInput' } } } },
        responses: {
          '201': { description: 'Meeting created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Meeting' } } } },
           '400': { $ref: '#/components/responses/BadRequest' },
           '409': { $ref: '#/components/responses/Conflict' }, // FK constraint (workgroupId)
           '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
    },
     '/meetings/{id}': {
         parameters: [ { $ref: '#/components/parameters/IdParam' } ],
        get: {
            summary: 'Get a meeting by ID',
            tags: ['Meetings'],
            responses: {
            '200': { description: 'Meeting details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Meeting' } } } },
             '404': { $ref: '#/components/responses/NotFound' },
             '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        put: {
            summary: 'Update a meeting by ID',
            tags: ['Meetings'],
            requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/MeetingInput' } } } },
            responses: {
            '200': { description: 'Meeting updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Meeting' } } } },
             '400': { $ref: '#/components/responses/BadRequest' },
             '409': { $ref: '#/components/responses/Conflict' }, // FK constraint (workgroupId)
             '404': { $ref: '#/components/responses/NotFound' }, // Meeting not found
             '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        delete: {
            summary: 'Delete a meeting by ID',
            tags: ['Meetings'],
            responses: {
             '204': { $ref: '#/components/responses/NoContent' },
             '404': { $ref: '#/components/responses/NotFound' },
             '409': { $ref: '#/components/responses/Conflict' }, // FK constraint (attendances)
             '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
     },

    // --- Attendances (Updated) ---
     '/attendances': {
        get: { // Updated GET
            summary: 'List all attendances',
            tags: ['Attendances'],
             // Removed filtering parameters
            responses: {
                '200': { description: 'A list of attendances', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Attendance' } } } } }, // Schema includes relations now
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        post: { // Updated POST
            summary: 'Create a new attendance record',
            tags: ['Attendances'],
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { $ref: '#/components/schemas/AttendancePOSTInput' } } } // Use new input schema
            },
            responses: { // Updated responses
                '201': { description: 'Attendance created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Attendance' } } } }, // Schema includes relations
                 '400': { $ref: '#/components/responses/BadRequest' }, // Invalid input
                 '409': { $ref: '#/components/responses/Conflict' }, // Composite PK already exists or FK constraint fails
                 '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
     },
      // Updated path using composite key parameter
      '/attendances/{memberId_meetingId}': {
         parameters: [ { $ref: '#/components/parameters/AttendanceKeyParam' } ], // Use defined composite key param
        get: { // Updated GET by key
            summary: 'Get a specific attendance record by its composite key',
            tags: ['Attendances'],
            responses: { // Updated responses
                '200': { description: 'Attendance details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Attendance' } } } }, // Use updated schema
                 '400': { $ref: '#/components/responses/BadRequest' }, // Invalid key format
                 '404': { $ref: '#/components/responses/NotFound' },
                 '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        delete: { // Updated DELETE by key
            summary: 'Delete a specific attendance record by its composite key',
            tags: ['Attendances'],
            responses: { // Updated responses
                 '204': { $ref: '#/components/responses/NoContent' },
                 '400': { $ref: '#/components/responses/BadRequest' }, // Invalid key format
                 '404': { $ref: '#/components/responses/NotFound' },
                  // 409 for FK not typical for attendance, maybe if something points TO attendance? Omitting for now.
                 '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
     },

    // --- Logbook Entries (Assuming no changes, add FK conflict on DELETE) ---
    '/logbookEntries': {
      get: {
        summary: 'List all logbook entries',
        tags: ['Logbook Entries'],
         parameters: [ { name: 'workgroupId', in: 'query', required: false, description: 'Filter logbook entries by Workgroup ID', schema: { type: 'integer' } } ],
        responses: {
          '200': { description: 'A list of logbook entries', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LogbookEntry' } } } } },
           '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
      // Add POST, PUT, DELETE for logbook entries if they exist
    },
    // Add '/logbookEntries/{id}' path if it exists
  },
}

export default swaggerDocument
