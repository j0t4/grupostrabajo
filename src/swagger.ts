export const swaggerDocument = {
  openapi: '3.0.0',
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
          id: { type: 'integer', description: 'The member ID' },
            name: {
              type: "string",
              description: "The member's name",
            },
            email:  {
               type: "string",
              format: "email",
              description: "The member's email address",
            },
          },
          required: ["id", "name", "email"],
      },
      MemberCreate: {
        type: 'object',
        properties: {
           name: {
            type: "string",
            description: "The member's name",
          },
          email: { type: 'string', format: 'email', description: 'The email of the member' },
        },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string", description: "Error message" },
        },
      },
      Message: {
        type: "object",
        properties: {
          message: { type: "string", description: "Success message" },
        },
      },
    },
  paths: {
    "/api/members": {
      get: {
        summary: "Get all members",
        tags: ["Members"],
        responses: {
          200: {
            description: "Successful response",
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
            description: 'Failed to fetch members',
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new member',
        tags: ['Members'],
        requestBody: {
          description: "Member object to be created",
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MemberCreate" },
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
      }
    },
    "/api/members/{id}": {
        get: {
          summary: "Get a member by ID",
          tags: ["Members"],
          parameters: [
            {
              in: "path",
              name: "id",
              schema: { type: "integer" },
              required: true,
              description: "ID of the member",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Member" },
                },
              },
            },
            404: {
              description: "Member not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
            500: {
              description: "Failed to fetch member",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
        put: {
          summary: "Update a member",
          tags: ["Members"],
          parameters: [
            {
              in: "path",
              name: "id",
              schema: { type: "integer" },
              required: true,
              description: "ID of the member",
            },
          ],
          requestBody: {
            description: "Updated member object",
            required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/MemberCreate",
                  },
                },
              },
            },
          responses: {
           200: {
            description: "Member updated",
            content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Member" },
                  },
                },
              },
              500: {
                description: "Failed to update member",
               content: {
                 "application/json": {
                   schema: { $ref: "#/components/schemas/Error" },
                 },
               },
              },
            },
          },
        },
      },
    },
}