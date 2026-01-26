// https://github.com/pleabargain/piano-app
// Script to convert usage-ideas.md to usage-ideas.html
import { marked } from 'marked';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Read the markdown file
const markdownPath = join(projectRoot, 'public', 'usage-ideas.md');
const markdownContent = readFileSync(markdownPath, 'utf-8');

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false
});

// Convert markdown to HTML
const htmlContent = marked.parse(markdownContent);

// Create full HTML document with styling
const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Usage Ideas for Piano Trainer</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    
    h2 {
      color: #34495e;
      margin-top: 40px;
      margin-bottom: 20px;
      padding-top: 20px;
      border-top: 2px solid #ecf0f1;
    }
    
    h3 {
      color: #34495e;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    
    h4 {
      color: #7f8c8d;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    
    p {
      margin-bottom: 15px;
    }
    
    ul, ol {
      margin-left: 30px;
      margin-bottom: 20px;
    }
    
    li {
      margin-bottom: 8px;
    }
    
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #e74c3c;
    }
    
    pre {
      background-color: #2c3e50;
      color: #ecf0f1;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin-bottom: 20px;
    }
    
    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
    }
    
    a {
      color: #3498db;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    blockquote {
      border-left: 4px solid #3498db;
      padding-left: 20px;
      margin-left: 0;
      color: #7f8c8d;
      font-style: italic;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    table th,
    table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    table th {
      background-color: #3498db;
      color: white;
      font-weight: bold;
    }
    
    table tr:hover {
      background-color: #f5f5f5;
    }
    
    hr {
      border: none;
      border-top: 2px solid #ecf0f1;
      margin: 30px 0;
    }
    
    strong {
      color: #2c3e50;
      font-weight: 600;
    }
    
    .quick-links {
      background-color: #e8f4f8;
      padding: 20px;
      border-radius: 5px;
      border-left: 4px solid #3498db;
      margin-bottom: 30px;
    }
    
    .quick-links h2 {
      margin-top: 0;
      border-top: none;
      padding-top: 0;
    }
    
    @media (max-width: 768px) {
      body {
        padding: 10px;
      }
      
      .container {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${htmlContent}
  </div>
</body>
</html>`;

// Write HTML file
const htmlPath = join(projectRoot, 'public', 'usage-ideas.html');
writeFileSync(htmlPath, fullHTML, 'utf-8');

console.log('✅ Successfully converted usage-ideas.md to usage-ideas.html');
console.log(`📄 Output: ${htmlPath}`);
