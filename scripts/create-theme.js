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
.dark, .dark-theme {
  --blue-1: #0c111c;
  --blue-2: #111725;
  --blue-3: #172448;
  --blue-4: #1d2e61;
  --blue-5: #243974;
  --blue-6: #2d4484;
  --blue-7: #375098;
  --blue-8: #405eb2;
  --blue-9: #3d63dd;
  --blue-10: #3f5cb0;
  --blue-11: #93b4ff;
  --blue-12: #d5e2ff;

  --blue-a1: #0012fb0c;
  --blue-a2: #1156f916;
  --blue-a3: #2b64ff3b;
  --blue-a4: #3567ff56;
  --blue-a5: #3f71fd6b;
  --blue-a6: #4b7afd7c;
  --blue-a7: #5480ff91;
  --blue-a8: #5783ffad;
  --blue-a9: #4571ffdb;
  --blue-a10: #5580feab;
  --blue-a11: #93b4ff;
  --blue-a12: #d5e2ff;

  --blue-contrast: #fff;
  --blue-surface: #111d3980;
  --blue-indicator: #3d63dd;
  --blue-track: #3d63dd;
}

@supports (color: color(display-p3 1 1 1)) {
  @media (color-gamut: p3) {
    .dark, .dark-theme {
      --blue-1: oklch(17.8% 0.0247 266.8);
      --blue-2: oklch(20.7% 0.0302 266.8);
      --blue-3: oklch(27.1% 0.0694 266.8);
      --blue-4: oklch(31.8% 0.0933 266.8);
      --blue-5: oklch(36.1% 0.1046 266.8);
      --blue-6: oklch(40.4% 0.1106 266.8);
      --blue-7: oklch(45% 0.1203 266.8);
      --blue-8: oklch(50.3% 0.1373 266.8);
      --blue-9: oklch(54.3% 0.1913 266.8);
      --blue-10: oklch(49.7% 0.1373 266.8);
      --blue-11: oklch(77.7% 0.1234 266.8);
      --blue-12: oklch(91.1% 0.0428 266.8);

      --blue-a1: color(display-p3 0 0.0706 0.9804 / 0.043);
      --blue-a2: color(display-p3 0.1176 0.3608 1 / 0.08);
      --blue-a3: color(display-p3 0.2275 0.4039 1 / 0.223);
      --blue-a4: color(display-p3 0.2627 0.4196 1 / 0.324);
      --blue-a5: color(display-p3 0.302 0.451 1 / 0.4);
      --blue-a6: color(display-p3 0.3451 0.4902 1 / 0.467);
      --blue-a7: color(display-p3 0.3725 0.5098 1 / 0.547);
      --blue-a8: color(display-p3 0.3843 0.5255 1 / 0.652);
      --blue-a9: color(display-p3 0.3176 0.451 1 / 0.824);
      --blue-a10: color(display-p3 0.3843 0.5176 1 / 0.643);
      --blue-a11: color(display-p3 0.6196 0.7216 1 / 0.975);
      --blue-a12: color(display-p3 0.8549 0.898 1 / 0.988);

      --blue-contrast: #fff;
      --blue-surface: color(display-p3 0.0706 0.1098 0.2118 / 0.5);
      --blue-indicator: oklch(54.3% 0.1913 266.8);
      --blue-track: oklch(54.3% 0.1913 266.8);
    }
  }
}
`;

const outputCSS = transformCSS(inputCSS);
console.log(outputCSS);
