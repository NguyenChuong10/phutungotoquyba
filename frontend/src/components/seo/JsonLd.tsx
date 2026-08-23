import React from "react";

interface JsonLdProps {
  id?: string;
  data: Record<string, any> | Array<Record<string, any>>;
}

export default function JsonLd({ id, data }: JsonLdProps) {
  return (
    <script
      id={id || `jsonld-${Math.random().toString(36).substring(2, 9)}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
