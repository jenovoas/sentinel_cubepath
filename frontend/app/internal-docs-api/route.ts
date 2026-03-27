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
        fileList.push(filePath.replace(base + '/', '').replace(/\\/g, '/'));
      }
    }
  } catch (err) {}
  return fileList;
}

export async function GET() {
  try {
    const docsDir = '/root/sentinel-cubepath/docs';
    const files = getMarkdownFiles(docsDir, docsDir);
    return NextResponse.json(files);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to read docs' }, { status: 500 });
  }
}
