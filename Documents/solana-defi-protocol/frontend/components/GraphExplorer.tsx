"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "graphiql/graphiql.css";
import type { Fetcher, FetcherParams, FetcherResult } from "@graphiql/toolkit";
import type { GraphiQLProps } from "graphiql";

const GraphiQL = dynamic<GraphiQLProps>(() => import("graphiql"), { ssr: false });

const defaultQuery = `query GetCiStatuses {
  ciStatuses(limit: 5) {
    pipeline
    status
    commit
    runId
    triggeredBy
    timestamp
  }
}`;

const fetcher: Fetcher = async (params: FetcherParams) => {
  try {
    const res = await fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const raw = (await res.json()) as unknown;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return raw as FetcherResult;
  } catch (error) {
    console.error("GraphQL fetch error:", error);
    throw error;
  }
};

const GraphExplorer = () => {
  const [query, setQuery] = useState(defaultQuery);
  const handleQueryEdit = (nextQuery?: string) => {
    setQuery(nextQuery ?? "");
  };
  return (
    <>
      <style jsx global>{`
        .graphiql-container {
          position: relative !important;
          z-index: 1 !important;
        }
        .graphiql-container * {
          pointer-events: auto !important;
        }
        .graphiql-container .graphiql-toolbar {
          pointer-events: auto !important;
          z-index: 10 !important;
        }
        .graphiql-container .graphiql-execute-button {
          pointer-events: auto !important;
          cursor: pointer !important;
          z-index: 10 !important;
        }
        .graphiql-container .CodeMirror {
          font-size: 16px !important;
          line-height: 1.8 !important;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace !important;
        }
        .graphiql-container .CodeMirror-lines {
          padding: 20px !important;
        }
        .graphiql-container .CodeMirror-scroll {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .graphiql-container .CodeMirror-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .graphiql-container .cm-editor {
          font-size: 16px !important;
          line-height: 1.8 !important;
        }
        .graphiql-container .cm-line {
          padding: 4px 0 !important;
          min-height: 1.8em !important;
        }
        .graphiql-container .cm-content {
          padding: 20px !important;
        }
        .graphiql-container * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .graphiql-container *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .graphiql-container .graphiql-query-editor {
          font-size: 16px !important;
        }
      `}</style>
      <div 
        className="graphiql-container" 
        style={{ 
          position: 'relative', 
          zIndex: 1,
          height: '650px',
          borderRadius: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden'
        }}
      >
        <GraphiQL fetcher={fetcher} query={query} onEditQuery={handleQueryEdit} />
      </div>
    </>
  );
};

export default GraphExplorer;

