// src/app/api/docs/route.ts
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../../../swagger'; // Adjust the path if necessary
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const html = swaggerUi.generateHTML(swaggerDocument, {}); // Pass empty options object
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}