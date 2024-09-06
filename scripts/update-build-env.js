const fs = require('fs');
const path = require('path');

const env = process.argv[2];

updateOrAddEnvVariable('S3_URL', env === 'prod' ? 's3://app.notenote.cc' : 's3://dev.notenote.cc');
updateOrAddEnvVariable('DISABLE_VERSION_JSON', env === 'prod' ? '' : 'true');

function updateOrAddEnvVariable(key, value) {
  const envPath = path.join(__dirname, '..', '.env'); // Adjust the path to your .env file
  let envContents = fs.readFileSync(envPath, 'utf-8');
  let lines = envContents.split('\n');

  let found = false;
  lines = lines.map(line => {
    const [currentKey] = line.split('=');
    if (currentKey === key) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    lines.push(`${key}=${value}`);
  }

  // Filter out any empty lines
  lines = lines.filter(line => line.trim() !== '');

  fs.writeFileSync(envPath, lines.join('\n'));
}
