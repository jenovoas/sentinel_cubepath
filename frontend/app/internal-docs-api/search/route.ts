import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import fs from 'fs';
import path from 'path';

function getMarkdownFiles(dir: string, base: string, fileList: string[] = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getMarkdownFiles(filePath, base, fileList);
      } else if (file.endsWith('.md')) {
        fileList.push(filePath);
      }
    }
  } catch (err) {}
  return fileList;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q) {
      return NextResponse.json([]);
    }

    const query = q.toLowerCase();
    const docsDir = '/root/sentinel-cubepath/docs';
    const allFiles = getMarkdownFiles(docsDir, docsDir);
    
    const matchedFiles: string[] = [];

    for (const file of allFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        // Search in filename or content
        if (file.toLowerCase().includes(query) || content.toLowerCase().includes(query)) {
          // Push relative path exactly as the main API does
          matchedFiles.push(file.replace(docsDir + '/', '').replace(/\\/g, '/'));
        }
      } catch (err) {
        continue;
      }
    }

    return NextResponse.json(matchedFiles);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to search docs' }, { status: 500 });
  }
}
