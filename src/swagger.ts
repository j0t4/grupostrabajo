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
      WorkgroupStatus: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        description: 'Status of the workgroup',
      },
      MemberStatus: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
        description: 'Status of the member',
      },
      MembershipRole: {
        type: 'string',
        enum: ['PRESIDENT', 'SECRETARY', 'ASSISTANT', 'GUEST'],
        description: 'Role within a membership',
      },
      MeetingType: {
        type: 'string',
        enum: ['PRESENTIAL', 'ONLINE'],
        description: 'Type of the meeting',
      },
      LogbookEntryType: {
        type: 'string',
        enum: ['ATTENDEES', 'AGENDA', 'DOCUMENTATION', 'MINUTES'],
        description: 'Type of logbook entry',
      },
      LogbookEntryStatus: {
        type: 'string',
        enum: ['ACTIVE', 'RESOLVED'],
        description: 'Status of logbook entry',
      },

      // --- Models ---
      Workgroup: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { $ref: '#/components/schemas/WorkgroupStatus' },
          deactivationDate: { type: 'string', format: 'date-time', nullable: true },
          parentId: { type: 'integer', nullable: true },
          // Related fields omitted for brevity in standard schema, shown in responses if needed
        },
        required: ['name', 'status'],
      },
      WorkgroupInput: { // Schema for POST/PUT requests
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          status: { $ref: '#/components/schemas/WorkgroupStatus' },
          deactivationDate: { type: 'string', format: 'date-time', nullable: true },
          parentId: { type: 'integer', nullable: true },
        },
        required: ['name'], // Status might default
      },
      Member: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          name: { type: 'string' },
          surname: { type: 'string' },
          email: { type: 'string', format: 'email' },
          dni: { type: 'string' },
          position: { type: 'string', nullable: true },
          organization: { type: 'string', nullable: true },
          phone1: { type: 'string', nullable: true },
          phone1Description: { type: 'string', nullable: true },
          phone2: { type: 'string', nullable: true },
          phone2Description: { type: 'string', nullable: true },
          phone3: { type: 'string', nullable: true },
          phone3Description: { type: 'string', nullable: true },
          status: { $ref: '#/components/schemas/MemberStatus' },
          deactivationDate: { type: 'string', format: 'date-time', nullable: true },
          deactivationDescription: { type: 'string', nullable: true },
        },
        required: ['name', 'surname', 'email', 'dni', 'status'],
      },
       MemberInput: { // Schema for POST/PUT requests
        type: 'object',
        properties: {
          name: { type: 'string' },
          surname: { type: 'string' },
          email: { type: 'string', format: 'email' },
          dni: { type: 'string' },
          position: { type: 'string', nullable: true },
          organization: { type: 'string', nullable: true },
          phone1: { type: 'string', nullable: true },
          phone1Description: { type: 'string', nullable: true },
          phone2: { type: 'string', nullable: true },
          phone2Description: { type: 'string', nullable: true },
          phone3: { type: 'string', nullable: true },
          phone3Description: { type: 'string', nullable: true },
          status: { $ref: '#/components/schemas/MemberStatus' },
          deactivationDate: { type: 'string', format: 'date-time', nullable: true },
          deactivationDescription: { type: 'string', nullable: true },
        },
        required: ['name', 'surname', 'email', 'dni'], // Status might default
      },
      Membership: {
        type: 'object',
        properties: {
          memberId: { type: 'integer' },
          workgroupId: { type: 'integer' },
          role: { $ref: '#/components/schemas/MembershipRole' },
          startDate: { type: 'string', format: 'date-time' }, // readOnly on update, set on creation
          endDate: { type: 'string', format: 'date-time', nullable: true },
          endDateDescription: { type: 'string', nullable: true },
           // Include related objects if needed in detailed responses
           member: { $ref: '#/components/schemas/Member', readOnly: true, nullable: true },
           workgroup: { $ref: '#/components/schemas/Workgroup', readOnly: true, nullable: true },
        },
        required: ['memberId', 'workgroupId', 'role', 'startDate'],
      },
       MembershipInput: { // Schema for POST requests
        type: 'object',
        properties: {
          memberId: { type: 'integer' },
          workgroupId: { type: 'integer' },
          role: { $ref: '#/components/schemas/MembershipRole' },
          // startDate defaults to now() via Prisma
          endDate: { type: 'string', format: 'date-time', nullable: true },
          endDateDescription: { type: 'string', nullable: true },
        },
        required: ['memberId', 'workgroupId', 'role'],
      },
       MembershipUpdateInput: { // Schema for PUT requests (updating existing membership)
        type: 'object',
        properties: {
           // Keys (memberId, workgroupId, startDate) are in path, not body
           role: { $ref: '#/components/schemas/MembershipRole' },
           endDate: { type: 'string', format: 'date-time', nullable: true },
           endDateDescription: { type: 'string', nullable: true },
        },
        required: ['role'], // Specify fields allowed for update
      },
      Meeting: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          workgroupId: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          date: { type: 'string', format: 'date-time' },
          type: { $ref: '#/components/schemas/MeetingType' },
          observations: { type: 'string', nullable: true },
          agenda: { type: 'string', nullable: true },
          minutes: { type: 'string', nullable: true },
           // Include related objects if needed
           workgroup: { $ref: '#/components/schemas/Workgroup', readOnly: true, nullable: true },
        },
        required: ['workgroupId', 'title', 'date', 'type'],
      },
       MeetingInput: { // Schema for POST/PUT requests
        type: 'object',
        properties: {
          workgroupId: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          date: { type: 'string', format: 'date-time' },
          type: { $ref: '#/components/schemas/MeetingType' },
          observations: { type: 'string', nullable: true },
          agenda: { type: 'string', nullable: true },
          minutes: { type: 'string', nullable: true },
        },
        required: ['workgroupId', 'title', 'date'], // Type might default
      },
      Attendance: {
        type: 'object',
        properties: {
          memberId: { type: 'integer' },
          meetingId: { type: 'integer' },
           // Include related objects if needed
           member: { $ref: '#/components/schemas/Member', readOnly: true, nullable: true },
           meeting: { $ref: '#/components/schemas/Meeting', readOnly: true, nullable: true },
        },
        required: ['memberId', 'meetingId'],
      },
       AttendanceInput: { // Schema for POST requests
        type: 'object',
        properties: {
          memberId: { type: 'integer' },
          meetingId: { type: 'integer' },
        },
        required: ['memberId', 'meetingId'],
      },
      LogbookEntry: {
        type: 'object',
        properties: {
          id: { type: 'integer', readOnly: true },
          workgroupId: { type: 'integer' },
          date: { type: 'string', format: 'date-time' }, // readOnly on update, set on creation
          description: { type: 'string' },
          type: { $ref: '#/components/schemas/LogbookEntryType' },
          status: { $ref: '#/components/schemas/LogbookEntryStatus' },
           // Include related objects if needed
           workgroup: { $ref: '#/components/schemas/Workgroup', readOnly: true, nullable: true },
        },
        required: ['workgroupId', 'description', 'type', 'status', 'date'],
      },
       LogbookEntryInput: { // Schema for POST/PUT requests
        type: 'object',
        properties: {
          workgroupId: { type: 'integer' },
          // date defaults to now() via Prisma on create
          description: { type: 'string' },
          type: { $ref: '#/components/schemas/LogbookEntryType' },
          status: { $ref: '#/components/schemas/LogbookEntryStatus' },
        },
        required: ['workgroupId', 'description', 'type'], // Status might default
      },
      ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', nullable: true }, // Allow message or error
            error: { type: 'string', nullable: true }
          },
          // required: ['message'] // Making it optional as one or the other might exist
        }
    },
    // --- Parameters (for composite keys and IDs) ---
    parameters: {
        IdParam: {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the resource',
            schema: { type: 'integer' }
        },
        MemberIdParam: {
            name: 'memberId',
            in: 'path',
            required: true,
            description: 'ID of the Member',
            schema: { type: 'integer' }
        },
        MeetingIdParam: {
            name: 'meetingId',
            in: 'path',
            required: true,
            description: 'ID of the Meeting',
            schema: { type: 'integer' }
        },
        WorkgroupIdParam: {
            name: 'workgroupId',
            in: 'path',
            required: true,
            description: 'ID of the Workgroup',
            schema: { type: 'integer' }
        },
         StartDateParam: {
            name: 'startDate',
            in: 'path',
            required: true,
            description: 'Start date of the Membership (ISO 8601 format string)',
            schema: { type: 'string', format: 'date-time' } // Or just string if conversion happens server-side
        },
        // Composite Key Params for URL segments
        AttendanceKeyParam: {
            name: 'memberId_meetingId', // Name used in Next.js dynamic route segment
            in: 'path',
            required: true,
            description: 'Composite key for Attendance: memberId_meetingId',
            schema: { type: 'string' }, // Represented as a string in the URL path
             style: 'simple', // Default, but good to be explicit for path params
             explode: false, // Default
        },
         MembershipKeyParam: {
            name: 'memberId_workgroupId_startDate', // Name used in Next.js dynamic route segment
            in: 'path',
            required: true,
            description: 'Composite key for Membership: memberId_workgroupId_startDate (startDate is ISO8601 string)',
            schema: { type: 'string' },
             style: 'simple',
             explode: false,
        },
    },
     // --- Responses (common ones) ---
    responses: {
        NotFound: {
            description: 'Resource not found',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
            }
        },
        BadRequest: {
            description: 'Invalid input data or malformed request',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
            }
        },
         Unauthorized: {
            description: 'Unauthorized access',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
            }
        },
        InternalServerError: {
            description: 'Internal server error',
             content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
            }
        },
        Conflict: { // e.g., trying to create resource that already exists
           description: 'Conflict creating resource',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
            }
        },
         NoContent: {
            description: 'Operation successful, no content returned (e.g., DELETE)',
         }
    }
  },
  paths: {
    // --- Workgroups ---
    '/workgroups': {
      get: {
        summary: 'List all workgroups',
        tags: ['Workgroups'],
        responses: {
          '200': {
            description: 'A list of workgroups',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Workgroup' } } } }
          },
           '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
      post: {
        summary: 'Create a new workgroup',
        tags: ['Workgroups'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkgroupInput' } } }
        },
        responses: {
          '201': {
            description: 'Workgroup created successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Workgroup' } } }
          },
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
          '200': {
            description: 'Workgroup details',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Workgroup' } } }
          },
          '404': { $ref: '#/components/responses/NotFound' },
           '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
      put: {
        summary: 'Update a workgroup by ID',
        tags: ['Workgroups'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkgroupInput' } } }
        },
        responses: {
          '200': {
            description: 'Workgroup updated successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Workgroup' } } }
          },
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
           '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
    },

    // --- Members ---
     '/members': {
      get: {
        summary: 'List all members',
        tags: ['Members'],
        responses: {
          '200': {
            description: 'A list of members',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Member' } } } }
          },
          '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
      post: {
        summary: 'Create a new member',
        tags: ['Members'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MemberInput' } } }
        },
        responses: {
          '201': {
            description: 'Member created successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Member' } } }
          },
           '400': { $ref: '#/components/responses/BadRequest' }, // Could be 409 if email/dni unique constraint fails
           '409': { $ref: '#/components/responses/Conflict' },
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
            '200': {
                description: 'Member details',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Member' } } }
            },
             '404': { $ref: '#/components/responses/NotFound' },
             '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        put: {
            summary: 'Update a member by ID',
            tags: ['Members'],
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { $ref: '#/components/schemas/MemberInput' } } }
            },
            responses: {
            '200': {
                description: 'Member updated successfully',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Member' } } }
            },
             '400': { $ref: '#/components/responses/BadRequest' }, // Could be 409 if email/dni unique constraint fails
             '409': { $ref: '#/components/responses/Conflict' },
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
             '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
     },

     // --- Memberships ---
     '/memberships': {
        get: {
            summary: 'List all memberships',
            tags: ['Memberships'],
            parameters: [ // Optional query parameters for filtering
                 {
                    name: 'memberId',
                    in: 'query',
                    required: false,
                    description: 'Filter memberships by Member ID',
                    schema: { type: 'integer' }
                 },
                 {
                    name: 'workgroupId',
                    in: 'query',
                    required: false,
                    description: 'Filter memberships by Workgroup ID',
                    schema: { type: 'integer' }
                 }
            ],
            responses: {
                '200': {
                    description: 'A list of memberships',
                    content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Membership' } } } }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        post: {
            summary: 'Create a new membership',
            tags: ['Memberships'],
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { $ref: '#/components/schemas/MembershipInput' } } }
            },
            responses: {
                '201': {
                    description: 'Membership created successfully',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Membership' } } }
                },
                 '400': { $ref: '#/components/responses/BadRequest' },
                 '404': { description: 'Referenced Member or Workgroup not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }}, // FK constraint
                 '409': { $ref: '#/components/responses/Conflict' }, // If composite PK already exists
                 '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
     },
      // Note: Using the specific composite key parameter defined earlier
     '/memberships/{memberId_workgroupId_startDate}': {
         parameters: [ { $ref: '#/components/parameters/MembershipKeyParam' } ],
        get: {
            summary: 'Get a specific membership by its composite key',
            tags: ['Memberships'],
            responses: {
                '200': {
                    description: 'Membership details',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Membership' } } }
                },
                 '400': { description: "Malformed composite key string", content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }},
                 '404': { $ref: '#/components/responses/NotFound' },
                 '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        put: { // Only for updating non-key fields like role, endDate
            summary: 'Update an existing membership (role, endDate)',
             tags: ['Memberships'],
             requestBody: {
                 required: true,
                 content: { 'application/json': { schema: { $ref: '#/components/schemas/MembershipUpdateInput' } } }
             },
             responses: {
                 '200': {
                    description: 'Membership updated successfully',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Membership' } } }
                 },
                 '400': { description: "Malformed composite key string or invalid update data", content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }},
                 '404': { $ref: '#/components/responses/NotFound' },
                 '500': { $ref: '#/components/responses/InternalServerError' }
             }
        },
        delete: {
            summary: 'Delete a specific membership by its composite key',
            tags: ['Memberships'],
            responses: {
                 '204': { $ref: '#/components/responses/NoContent' },
                 '400': { description: "Malformed composite key string", content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }},
                 '404': { $ref: '#/components/responses/NotFound' },
                 '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
     },

    // --- Meetings ---
     '/meetings': {
      get: {
        summary: 'List all meetings',
        tags: ['Meetings'],
         parameters: [ // Optional query parameters for filtering
             {
                name: 'workgroupId',
                in: 'query',
                required: false,
                description: 'Filter meetings by Workgroup ID',
                schema: { type: 'integer' }
             }
        ],
        responses: {
          '200': {
            description: 'A list of meetings',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Meeting' } } } }
          },
          '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
      post: {
        summary: 'Create a new meeting',
        tags: ['Meetings'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MeetingInput' } } }
        },
        responses: {
          '201': {
            description: 'Meeting created successfully',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Meeting' } } }
          },
           '400': { $ref: '#/components/responses/BadRequest' },
           '404': { description: 'Referenced Workgroup not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }}, // FK constraint
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
            '200': {
                description: 'Meeting details',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Meeting' } } }
            },
             '404': { $ref: '#/components/responses/NotFound' },
             '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        put: {
            summary: 'Update a meeting by ID',
            tags: ['Meetings'],
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { $ref: '#/components/schemas/MeetingInput' } } }
            },
            responses: {
            '200': {
                description: 'Meeting updated successfully',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Meeting' } } }
            },
             '400': { $ref: '#/components/responses/BadRequest' },
              '404': { $ref: '#/components/responses/NotFound' }, // Meeting or referenced Workgroup not found
             '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        delete: {
            summary: 'Delete a meeting by ID',
            tags: ['Meetings'],
            responses: {
             '204': { $ref: '#/components/responses/NoContent' },
             '404': { $ref: '#/components/responses/NotFound' },
             '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
     },

    // --- Attendances ---
     '/attendances': {
        get: {
            summary: 'List all attendances',
            tags: ['Attendances'],
             parameters: [ // Optional query parameters for filtering
                 {
                    name: 'memberId',
                    in: 'query',
                    required: false,
                    description: 'Filter attendances by Member ID',
                    schema: { type: 'integer' }
                 },
                 {
                    name: 'meetingId',
                    in: 'query',
                    required: false,
                    description: 'Filter attendances by Meeting ID',
                    schema: { type: 'integer' }
                 }
             ],
            responses: {
                '200': {
                    description: 'A list of attendances',
                    content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Attendance' } } } }
                },
                '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        post: {
            summary: 'Create a new attendance record',
            tags: ['Attendances'],
            requestBody: {
                required: true,
                content: { 'application/json': { schema: { $ref: '#/components/schemas/AttendanceInput' } } }
            },
            responses: {
                '201': {
                    description: 'Attendance created successfully',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Attendance' } } }
                },
                 '400': { $ref: '#/components/responses/BadRequest' },
                 '404': { description: 'Referenced Member or Meeting not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }}, // FK constraint
                 '409': { $ref: '#/components/responses/Conflict' }, // If composite PK already exists
                 '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
     },
      // Note: Using the specific composite key parameter defined earlier
      '/attendances/{memberId_meetingId}': {
         parameters: [ { $ref: '#/components/parameters/AttendanceKeyParam' } ],
        get: {
            summary: 'Get a specific attendance record by its composite key',
            tags: ['Attendances'],
            responses: {
                '200': {
                    description: 'Attendance details',
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/Attendance' } } }
                },
                 '400': { description: "Malformed composite key string", content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }},
                 '404': { $ref: '#/components/responses/NotFound' },
                 '500': { $ref: '#/components/responses/InternalServerError' }
            }
        },
        delete: {
            summary: 'Delete a specific attendance record by its composite key',
            tags: ['Attendances'],
            responses: {
                 '204': { $ref: '#/components/responses/NoContent' },
                  '400': { description: "Malformed composite key string", content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }},
                 '404': { $ref: '#/components/responses/NotFound' },
                 '500': { $ref: '#/components/responses/InternalServerError' }
            }
        }
     },

    // --- Logbook Entries ---
    '/logbookEntries': {
      get: {
        summary: 'List all logbook entries',
        tags: ['Logbook Entries'],
         parameters: [ // Optional query parameters for filtering
             {
                name: 'workgroupId',
                in: 'query',
                required: false,
                description: 'Filter logbook entries by Workgroup ID',
                schema: { type: 'integer' }
             }
        ],
        responses: {
          '200': {
            description: 'A list of logbook entries',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/LogbookEntry' } } } }
          },
           '500': { $ref: '#/components/responses/InternalServerError' }
        },
      },
    },
  },
}

export default swaggerDocument