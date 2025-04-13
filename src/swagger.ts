export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "API documentation generated from Next.js routes",
  },
  components: {
    schemas: {
      Member: {
        type: "object",
        properties: {
          id: { type: "integer", description: "The member ID" },
          name: { type: "string", description: "The name of the member" },
          email: { type: "string", format: "email", description: "The email of the member" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string", description: "Error message" },
        },
      },
    },
    "/api/members": {
      get: {
        summary: "Get all members",
        tags: ["Members"],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Member" },
                },
              },
            },
          },
          500: {
            description: "Failed to fetch members",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new member",
        tags: ["Members"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Member",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Member created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Member" },
              },
            },
          },
          500: {
            description: "Failed to create member",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/logbookEntries/{id}": {
      get: {
        summary: "Get a logbook entry by ID",
        tags: ["Logbook Entries"],
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'integer',
            },
            required: true,
            description: "ID of the logbook entry",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  properties: {
                    id: { type: 'integer' },
                    // ... other properties
                  },
                },
              },
            },
          },
          404: {
            description: 'Logbook entry not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to fetch logbook entry',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update a logbook entry',
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the logbook entry',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                // Add properties for updating a logbook entry
                properties: {
                  // ... properties for updating a logbook entry
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Logbook entry updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  // Add properties based on your LogbookEntry model
                  properties: {
                    id: { type: 'integer' },
                    // ... other properties
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to update logbook entry',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a logbook entry',
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the logbook entry',
          },
        ],
        responses: {
          200: {
            description: 'Logbook entry deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to delete logbook entry',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/attendances/{memberId}_{meetingId}': {
      get: {
        summary: 'Get an attendance by member and meeting IDs',
        parameters: [
          {
            in: 'path',
            name: 'memberId',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the member',
          },
          {
            in: 'path',
            name: 'meetingId',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the meeting',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  // Add properties based on your Attendance model
                  properties: {
                    memberId: { type: 'integer' },
                    meetingId: { type: 'integer' },
                    // ... other properties
                  },
                },
              },
            },
          },
          404: {
            description: 'Attendance not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to fetch attendance',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update an attendance',
        parameters: [
          {
            in: 'path',
            name: 'memberId',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the member',
          },
          {
            in: 'path',
            name: 'meetingId',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the meeting',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                // Add properties for updating an attendance
                properties: {
                  // ... properties for updating an attendance
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Attendance updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  // Add properties based on your Attendance model
                  properties: {
                    memberId: { type: 'integer' },
                    meetingId: { type: 'integer' },
                    // ... other properties
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to update attendance',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete an attendance',
        parameters: [
          {
            in: 'path',
            name: 'memberId',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the member',
          },
          {
            in: 'path',
            name: 'meetingId',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the meeting',
          },
        ],
        responses: {
          200: {
            description: 'Attendance deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to delete attendance',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/meetings/{id}': {
      get: {
        summary: 'Get a meeting by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the meeting',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  // Add properties based on your Meeting model
                  properties: {
                    id: { type: 'integer' },
                    // ... other properties
                  },
                },
              },
            },
          },
          404: {
            description: 'Meeting not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to fetch meeting',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update a meeting',
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the meeting',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                // Add properties for updating a meeting
                properties: {
                  // ... properties for updating a meeting
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Meeting updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  // Add properties based on your Meeting model
                  properties: {
                    id: { type: 'integer' },
                    // ... other properties
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to update meeting',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a meeting',
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the meeting',
          },
        ],
        responses: {
          200: {
            description: 'Meeting deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to delete meeting',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/members/{id}': {
      get: {
        summary: 'Get a member by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the member',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  // Add properties based on your Member model
                  properties: {
                    id: { type: 'integer' },
                    // ... other properties
                  },
                },
              },
            },
          },
          404: {
            description: 'Member not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to fetch member',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update a member',
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the member',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                // Add properties for updating a member
                properties: {
                  // ... properties for updating a member
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Member updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  // Add properties based on your Member model
                  properties: {
                    id: { type: 'integer' },
                    // ... other properties
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to update member',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a member',
        parameters: [
          {
            in: 'path',
            name: 'id',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the member',
          },
        ],
        responses: {
          200: {
            description: 'Member deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to delete member',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/memberships/{memberId}_{workgroupId}_{startDate}': {
      get: {
        summary: 'Get a membership by member, workgroup, and start date',
        parameters: [
          {
            in: 'path',
            name: 'memberId',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the member',
          },
          {
            in: 'path',
            name: 'workgroupId',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the workgroup',
          },
          {
            in: 'path',
            name: 'startDate',
            schema: {
              type: 'string',
              format: 'date',
            },
            required: true,
            description: 'Start date of the membership (YYYY-MM-DD)',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  // Add properties based on your Membership model
                  properties: {
                    memberId: { type: 'integer' },
                    workgroupId: { type: 'integer' },
                    startDate: { type: 'string', format: 'date' },
                    // ... other properties
                  },
                },
              },
            },
          },
          404: {
            description: 'Membership not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to fetch membership',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update a membership',
        parameters: [
          {
            in: 'path',
            name: 'memberId',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the member',
          },
          {
            in: 'path',
            name: 'workgroupId',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the workgroup',
          },
          {
            in: 'path',
            name: 'startDate',
            schema: {
              type: 'string',
              format: 'date',
            },
            required: true,
            description: 'Start date of the membership (YYYY-MM-DD)',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                // Add properties for updating a membership
                properties: {
                  // ... properties for updating a membership
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Membership updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  // Add properties based on your Membership model
                  properties: {
                    memberId: { type: 'integer' },
                    workgroupId: { type: 'integer' },
                    startDate: { type: 'string', format: 'date' },
                    // ... other properties
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to update membership',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a membership',
        parameters: [
          {
            in: 'path',
            name: 'memberId',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the member',
          },
          {
            in: 'path',
            name: 'workgroupId',
            schema: {
              type: 'integer',
            },
            required: true,
            description: 'ID of the workgroup',
          },
          {
            in: 'path',
            name: 'startDate',
            schema: {
              type: 'string',
              format: 'date',
            },
            required: true,
            description: 'Start date of the membership (YYYY-MM-DD)',
          },
        ],
        responses: {
          200: {
            description: 'Membership deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          500: {
            description: "Failed to delete logbook entry",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
                },
              },
            },
          },
        },
      }
    }