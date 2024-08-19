export const convertToMarkdown = html => {
  return (
    html
      // Convert headers
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<h4>(.*?)<\/h4>/gi, '#### $1\n')
      .replace(/<h5>(.*?)<\/h5>/gi, '##### $1\n')
      .replace(/<h6>(.*?)<\/h6>/gi, '###### $1\n')
      // Convert unordered lists
      .replace(/<ul>\s*((<li>.*?<\/li>\s*)+)<\/ul>/gi, (match, items) => {
        return items.replace(/<li>(.*?)<\/li>/gi, '- $1\n').replace(/<br\s*\/?>/gi, '');
      })
      // Convert ordered lists
      .replace(/<ol>\s*((<li>.*?<\/li>\s*)+)<\/ol>/gi, (match, items) => {
        let index = 1;
        return items.replace(/<li>(.*?)<\/li>/gi, (itemMatch, itemContent) => {
          return `${index++}. ${itemContent.replace(/<br\s*\/?>/gi, '')}\n`;
        });
      })
      // Convert blockquotes
      .replace(/<blockquote>(.*?)<\/blockquote>/gis, (match, content) => {
        return content.replace(/<p>(.*?)<\/p>/gi, '> $1\n').replace(/<br\s*\/?>/gi, '');
      })
      // Convert <div><br></div> to a single newline
      .replace(/<div>\s*<br\s*\/?>\s*<\/div>/gi, '\n')
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '\n')
      // Convert <div> to newline
      .replace(/<div>(.*?)<\/div>/gi, '$1\n')
      .replace(/<p>(.*?)<\/p>/gi, '$1\n')
      // Convert <br> to newline
      .replace(/<br\s*\/?>/gi, '\n')
      // Convert <a> to links
      .replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, (match, href, text) => {
        return `[${text}](${href})`;
      })
      // Convert <strong> <b> to **
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      // Convert <em> <i> to __
      .replace(/<em>(.*?)<\/em>/gi, '__$1__')
      .replace(/<i>(.*?)<\/i>/gi, '__$1__')
      // Convert <del> to ~~
      .replace(/<del>(.*?)<\/del>/gi, '~~$1~~')
      // Convert <mark> to ==
      .replace(/<mark>(.*?)<\/mark>/gi, '==$1==')
      // Convert <code> to `
      .replace(/<code>(.*?)<\/code>/gi, '`$1`')
      // Convert &nbsp; to space
      .replace(/&nbsp;/g, ' ')
      // Remove zero width spaces
      // eslint-disable-next-line no-misleading-character-class
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
      // replace starting and ending newlines
      .replace(/^\n+|\n+$/g, '')
      // Remove any remaining HTML tags
      .replace(/<[^>]+>/g, '')
  );
};

export function parseMarkdown(markdown) {
  // Split the input into lines
  const lines = markdown.split('\n');
  let html = '';
  let lineType = null;

  const closeTag = () => {
    if (['ul', 'ol', 'blockquote'].includes(lineType)) {
      html += `</${lineType}>`;
      lineType = null;
    }
  };

  lines.forEach(line => {
    // Remove leading and trailing whitespace
    line = parseInlineMarkdown(line);

    // Handle headers
    if (/^#{1,6} /.test(line)) {
      if (lineType !== 'header') {
        closeTag();
        lineType = 'header';
      }
      const headerLevel = line.match(/^#+/)[0].length;
      const headerText = line.slice(headerLevel + 1).trim();
      html += `<h${headerLevel}>${headerText}</h${headerLevel}>`;
    }
    // Handle unordered lists
    else if (/^- /.test(line) || /^\* /.test(line)) {
      if (lineType !== 'ul') {
        closeTag();
        html += '<ul>';
        lineType = 'ul';
      }
      const listItem = line.slice(2).trim();
      html += `<li>${listItem}</li>`;
    }
    // Handle ordered lists
    else if (/^\d+\. /.test(line)) {
      if (lineType !== 'ol') {
        closeTag();
        html += '<ol>';
        lineType = 'ol';
      }
      const listItem = line.replace(/^\d+\.\s*/, '').trim();
      html += `<li>${listItem}</li>`;
    }
    // Handle blockquotes
    else if (/^> /.test(line)) {
      if (lineType !== 'blockquote') {
        closeTag();
        html += '<blockquote>';
        lineType = 'blockquote';
      }
      const blockquoteText = line.slice(2).trim();
      html += `<p>${blockquoteText}</p>`;
    }
    // Handle paragraphs
    else {
      if (lineType !== 'p') {
        closeTag();
      }
      lineType = 'p';
      html += `<p>${line || '<br>'}</p>`;
    }
  });

  closeTag();

  return html;
}

const parseInlineMarkdown = markdown => {
  return (
    markdown
      // Link
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/__(.*?)__/gim, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/gim, '<del>$1</del>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // Highlight
      .replace(/==(.*?)==/gim, '<mark>$1</mark>')
  );
};
