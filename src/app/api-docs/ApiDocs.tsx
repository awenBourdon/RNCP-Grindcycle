'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
});

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-0">
        <div className="mb-6 space-y-2">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Grindcycle
          </p>
          <h1 className="text-3xl font-semibold">Documentation API</h1>
          <p className="text-base text-muted-foreground">
            Visualisation interactive de la spécification OpenAPI générée depuis{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              /api-docs/json
            </code>
            . Les routes protégées requièrent une session Better Auth active.
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <SwaggerUI
            url="/api-docs/json"
            docExpansion="list"
            defaultModelsExpandDepth={1}
            defaultModelExpandDepth={1}
            deepLinking
          />
        </div>
      </div>
    </div>
  );
}

