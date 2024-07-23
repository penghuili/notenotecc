const fs = require('fs');
const timestamp = new Date()
  .toISOString()
  .replace(/[^0-9]/g, '')
  .slice(0, 14);

async function addTimestampToAssetsInIndex() {
  try {
    const htmlContent = fs.readFileSync('dist/index.html', 'utf-8');

    const scriptSrcRegex = /(<script[^>]*\s+src=["'])(\/assets\/[^"']+)(["'][^>]*>)/g;
    const linkHrefRegex = /(<link[^>]*\s+href=["'])(\/assets\/[^"']+)(["'][^>]*>)/g;

    let updatedHtmlContent = htmlContent.replace(scriptSrcRegex, `$1/${timestamp}$2$3`);
    updatedHtmlContent = updatedHtmlContent.replace(linkHrefRegex, `$1/${timestamp}$2$3`);

    // Write the modified content to the output file
    fs.writeFileSync('dist/index.html', updatedHtmlContent, 'utf-8');

    console.log(`Updated index.html with timestamp: ${timestamp}`);
  } catch (error) {
    console.error('Error processing HTML file:', error);
  }
}

addTimestampToAssetsInIndex();
