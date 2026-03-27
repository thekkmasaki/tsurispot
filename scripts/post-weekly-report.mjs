// Weekly report poster for microCMS
// Usage: node scripts/post-weekly-report.mjs <json-file>

import { readFileSync } from 'fs';
import { resolve } from 'path';

const API_KEY = 'pd3VA0nt4yNInv3uBWbFxymzliuaDr4hF20v';
const ENDPOINT = 'https://tsurispot.microcms.io/api/v1/blogs';

async function postArticle(filePath) {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));

  const body = JSON.stringify({
    title: data.title,
    content: data.content,
    slug: data.slug,
    description: data.description,
    tags: data.tags,
  });

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-MICROCMS-API-KEY': API_KEY,
    },
    body,
  });

  const text = await res.text();
  console.log(`Status: ${res.status}`);
  console.log(`Response: ${text}`);
  return { status: res.status, body: text };
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/post-weekly-report.mjs <json-file>');
  process.exit(1);
}

postArticle(resolve(filePath)).catch(console.error);
