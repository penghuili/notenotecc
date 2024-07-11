export function makeImageSquare(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const size = Math.max(img.width, img.height);
      canvas.width = size;
      canvas.height = size;

      // Get colors for gradient
      const colors = getImageColors(img);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      colors.forEach((color, index) => {
        gradient.addColorStop(index / (colors.length - 1), color);
      });

      // Fill background with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Draw image
      const x = (size - img.width) / 2;
      const y = (size - img.height) / 2;
      ctx.drawImage(img, x, y);

      resolve(canvas);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function getImageColors(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const colorCounts = {};
  const sampleSize = Math.floor(data.length / 4 / 100); // Sample 1% of pixels

  for (let i = 0; i < data.length; i += 4 * sampleSize) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const rgb = `rgb(${r},${g},${b})`;
    colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
  }

  // Convert to array and sort by frequency
  const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);

  // Filter out very dark colors and adjust brightness
  const brightColors = sortedColors
    .map(([color, count]) => {
      const [r, g, b] = color.match(/\d+/g).map(Number);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      if (brightness < 30) return null; // Filter out very dark colors

      // Adjust brightness
      const factor = Math.max(1, 128 / brightness);
      return {
        color: `rgb(${Math.min(255, r * factor)},${Math.min(255, g * factor)},${Math.min(255, b * factor)})`,
        count: count,
      };
    })
    .filter(Boolean);

  // Ensure color diversity
  const finalColors = [];
  const hueThreshold = 30; // degrees
  for (let i = 0; i < brightColors.length && finalColors.length < 3; i++) {
    const color = brightColors[i].color;
    if (!finalColors.some(c => colorDistance(c, color) < hueThreshold)) {
      finalColors.push(color);
    }
  }

  // If we don't have 3 colors, add some default light colors
  while (finalColors.length < 3) {
    finalColors.push(
      `rgb(${200 + Math.random() * 55},${200 + Math.random() * 55},${200 + Math.random() * 55})`
    );
  }

  return finalColors;
}

function colorDistance(color1, color2) {
  const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
  const [r2, g2, b2] = color2.match(/\d+/g).map(Number);
  return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
}
