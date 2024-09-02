const fs = require('fs').promises;
const path = require('path');

const VERSION_FILE = path.join(__dirname, 'react-versions.json');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m', // Scarlet
  },
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m',
  },
};

async function getLibVersion(lib, versionKey) {
  const response = await fetch(`https://registry.npmjs.org/${lib}`);
  const data = await response.json();
  return data['dist-tags'][versionKey];
}

async function getStoredVersions() {
  try {
    const data = await fs.readFile(VERSION_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

async function getStoredVersion(lib) {
  try {
    const data = await getStoredVersions();

    return data[lib];
  } catch (error) {
    return null;
  }
}

async function storeVersion(lib, version) {
  const currentVersions = await getStoredVersions();
  const data = { ...currentVersions, [lib]: version };
  await fs.writeFile(VERSION_FILE, JSON.stringify(data, null, 2));
}

async function checkVersion(lib, versionKey) {
  try {
    const latestVersion = await getLibVersion(lib, versionKey);
    const storedVersion = await getStoredVersion(lib);

    if (latestVersion && latestVersion !== storedVersion) {
      await storeVersion(lib, latestVersion);
      console.log(`${colors.fg.green}${lib}: ${latestVersion}${colors.reset}`);
    } else {
      console.log(`${lib}: No new version`);
    }
  } catch (error) {
    console.error('Error checking version:', error);
  }
}

async function checkLibs() {
  await checkVersion('react', 'rc');
  await checkVersion('babel-plugin-react-compiler', 'experimental');
  await checkVersion('eslint-plugin-react-compiler', 'experimental');
}

checkLibs();
