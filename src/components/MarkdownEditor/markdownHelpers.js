export const convertToMarkdown = html => {
  // Helper function to convert lists recursively
  const convertList = (listElement, indent = '') => {
    let markdown = '';
    const listItems = listElement.querySelectorAll(':scope > li');

    listItems.forEach((item, index) => {
      const isOrdered = listElement.tagName.toLowerCase() === 'ol';
      const bullet = isOrdered ? `${index + 1}.` : '-';

      // Process the content of the list item
      let content = '';
      for (const node of item.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          content += node.textContent.trim();
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName.toLowerCase() === 'ul' || node.tagName.toLowerCase() === 'ol') {
            // Handle nested list
            content += '\n' + convertList(node, indent + '  ');
          } else {
            // Process other HTML elements
            content += node.outerHTML;
          }
        }
      }

      markdown += `${indent}${bullet} ${content.trim()}\n`;
    });

    return markdown;
  };

  // Create a temporary element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Convert lists
  tempDiv.querySelectorAll('ul, ol').forEach(list => {
    if (!list.closest('li')) {
      // Only process top-level lists
      const markdown = convertList(list);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = markdown;
      list.parentNode.replaceChild(wrapper, list);
    }
  });

  // Get the modified HTML
  html = tempDiv.innerHTML;

  return (
    html
      // Convert headers
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<h4>(.*?)<\/h4>/gi, '#### $1\n')
      .replace(/<h5>(.*?)<\/h5>/gi, '##### $1\n')
      .replace(/<h6>(.*?)<\/h6>/gi, '###### $1\n')
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
      // Remove any remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // replace starting and ending newlines
      .replace(/^\n+|\n+$/g, '')
  );
};

export function parseMarkdown(markdown) {
  // Split the input into lines
  const lines = markdown.split('\n');
  let html = '';
  let lineType = null;
  let listStack = [];

  function getIndentLevel(line) {
    return line.search(/\S|$/);
  }

  const closeTag = () => {
    if (['ul', 'ol', 'blockquote'].includes(lineType)) {
      html += `</${lineType}>`;
      lineType = null;
    }
  };

  function closeList(toLevel) {
    while (listStack.length > toLevel) {
      html += `</li></${listStack.pop()}>`;
    }
  }

  lines.forEach((line, index) => {
    line = parseInlineMarkdown(line);
    const trimmedLine = line.trim();

    if (/^- /.test(trimmedLine) || /^\* /.test(trimmedLine)) {
      const indentLevel = getIndentLevel(line);

      const listItem = trimmedLine.slice(2);
      if (listStack.length === 0 || indentLevel > getIndentLevel(lines[index - 1])) {
        html += '<ul>';
        listStack.push('ul');
      } else if (indentLevel < getIndentLevel(lines[index - 1])) {
        closeList(getIndentLevel(lines[index - 1]) / 2);
      } else {
        html += '</li>';
      }
      html += `<li>${listItem}`;
    }
    // Handle ordered lists
    else if (/^\d+\. /.test(trimmedLine)) {
      const indentLevel = getIndentLevel(line);
      const listItem = trimmedLine.replace(/^\d+\.\s*/, '');
      if (listStack.length === 0 || indentLevel > getIndentLevel(lines[index - 1])) {
        html += '<ol>';
        listStack.push('ol');
      } else if (indentLevel < getIndentLevel(lines[index - 1])) {
        closeList(getIndentLevel(lines[index - 1]) / 2);
      } else {
        html += '</li>';
      }
      html += `<li>${listItem}`;
    } else {
      closeList(0);

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
    }
  });

  closeList(0);
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

export const getCursorPosition = element => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(element);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const fullText = preSelectionRange.toString();
    const visibleText = fullText.replace(/[*_~`=]/g, '');
    return visibleText.length;
  }

  return null;
};

export const restoreCursorPosition = (element, position) => {
  if (position === null) {
    return;
  }

  const selection = window.getSelection();
  const range = document.createRange();

  let currentLength = 0;
  let targetNode = null;
  let targetOffset = 0;

  const traverseNodes = node => {
    if (targetNode) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const visibleLength = node.textContent.length;
      if (currentLength + visibleLength >= position) {
        targetNode = node;
        targetOffset = position - currentLength;
      } else {
        currentLength += visibleLength;
      }
    } else {
      for (let child of node.childNodes) {
        traverseNodes(child);
      }
    }
  };

  traverseNodes(element);

  if (targetNode) {
    range.setStart(targetNode, targetOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

export function isValidUrl(string) {
  const trimed = string?.trim() || '';
  if (!trimed || hasSpaces(trimed)) {
    return false;
  }

  try {
    const url = new URL(trimed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

function hasSpaces(string) {
  return /\s/.test(string);
}
