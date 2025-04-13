// src/app/docs/page.tsx
'use client'; // Mark this component as a Client Component

import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css'; // Import basic styles

// Optional: Define a type for the spec if you have one
// interface Spec { [key: string]: any; }

const SwaggerDocsPage: React.FC = () => {
  return (
    <div>
      <SwaggerUI url="/api/docs" />
    </div>
  );
};

export default SwaggerDocsPage;
