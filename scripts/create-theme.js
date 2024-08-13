function transformCSS(inputCSS) {
  // Replace --blue with --tomato
  let transformedCSS = inputCSS.replace(/--blue/g, '--tomato');

  // Add !important to each CSS variable declaration
  transformedCSS = transformedCSS.replace(
    /(#[0-9a-fA-F]{3,8}|oklch\([^)]+\)|color\([^)]+\))\s*;/g,
    '$1 !important;'
  );

  return transformedCSS;
}

// Example usage
const inputCSS = `
:root, .light, .light-theme {
  --blue-1: #fcfdfe;
  --blue-2: #f7f9ff;
  --blue-3: #edf2fe;
  --blue-4: #e1eaff;
  --blue-5: #d2dfff;
  --blue-6: #c0d1fe;
  --blue-7: #aabff6;
  --blue-8: #8ca5ee;
  --blue-9: #5474ec;
  --blue-10: #4967dc;
  --blue-11: #4561cf;
  --blue-12: #202e5e;

  --blue-a1: #0055aa03;
  --blue-a2: #0040ff08;
  --blue-a3: #0047f112;
  --blue-a4: #004dff1e;
  --blue-a5: #004aff2d;
  --blue-a6: #0045fb3f;
  --blue-a7: #003fe455;
  --blue-a8: #0038da73;
  --blue-a9: #0030e3ab;
  --blue-a10: #002aceb6;
  --blue-a11: #0027bdba;
  --blue-a12: #001047df;

  --blue-contrast: #fff;
  --blue-surface: #f5f8ffcc;
  --blue-indicator: #5474ec;
  --blue-track: #5474ec;
}

@supports (color: color(display-p3 1 1 1)) {
  @media (color-gamut: p3) {
    :root, .light, .light-theme {
      --blue-1: oklch(99.4% 0.002 269);
      --blue-2: oklch(98.2% 0.008 269);
      --blue-3: oklch(96% 0.017 269);
      --blue-4: oklch(93.6% 0.033 269);
      --blue-5: oklch(90.4% 0.049 269);
      --blue-6: oklch(86.3% 0.066 269);
      --blue-7: oklch(80.8% 0.082 269);
      --blue-8: oklch(73.2% 0.11 269);
      --blue-9: oklch(59.9% 0.184 269);
      --blue-10: oklch(55.6% 0.182 269);
      --blue-11: oklch(53.2% 0.173 269);
      --blue-12: oklch(31.8% 0.087 269);

      --blue-a1: color(display-p3 0.024 0.349 0.675 / 0.012);
      --blue-a2: color(display-p3 0.02 0.267 0.878 / 0.032);
      --blue-a3: color(display-p3 0.008 0.239 0.886 / 0.067);
      --blue-a4: color(display-p3 0.004 0.255 0.929 / 0.11);
      --blue-a5: color(display-p3 0.004 0.259 0.933 / 0.169);
      --blue-a6: color(display-p3 0.004 0.22 0.918 / 0.236);
      --blue-a7: color(display-p3 0.004 0.2 0.827 / 0.318);
      --blue-a8: color(display-p3 0.004 0.176 0.792 / 0.432);
      --blue-a9: color(display-p3 0 0.149 0.835 / 0.644);
      --blue-a10: color(display-p3 0 0.133 0.761 / 0.691);
      --blue-a11: color(display-p3 0 0.118 0.694 / 0.706);
      --blue-a12: color(display-p3 0 0.051 0.255 / 0.863);

      --blue-contrast: #fff;
      --blue-surface: color(display-p3 0.961 0.973 0.996 / 0.8);
      --blue-indicator: oklch(59.9% 0.184 269);
      --blue-track: oklch(59.9% 0.184 269);
    }
  }
}
`;

const outputCSS = transformCSS(inputCSS);
console.log(outputCSS);
