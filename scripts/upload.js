// postBuild.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const timestamp = new Date()
  .toISOString()
  .replace(/[^0-9]/g, '')
  .slice(0, 14);
const version = new Date()
  .toISOString()
  .replace(/[^0-9]/g, '')
  .slice(2, 12);

updateOrAddEnvVariable('PUBLIC_URL', `/${timestamp}`);
updateOrAddEnvVariable('REACT_APP_VERSION', version);

require('dotenv').config();

buildApp();

uploadStatic();

uploadIndex();

if (!process.env.DISABLE_VERSION_JSON) {
  uploadVersionJson();
}

function updateOrAddEnvVariable(key, value) {
  const envPath = path.join(__dirname, '..', '.env.production'); // Adjust the path to your .env file
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

function buildApp() {
  console.log('Building the app...');
  execSync(`npm run build`);
  console.log('Build app completed.');
}

function uploadStatic() {
  console.log('Uploading assets to S3...');
  execSync(
    `aws s3 sync dist/assets ${process.env.S3_URL}/assets --delete --cache-control max-age=31536000,public`
  );
  console.log('Upload assets to S3 completed.');
}

function uploadIndex() {
  console.log('Uploading index.html to S3...');
  execSync(
    `aws s3 cp dist/index.html ${process.env.S3_URL}/index.html --cache-control max-age=0,no-store`
  );
  console.log('Upload index.html to S3 completed.');
}

function uploadVersionJson() {
  console.log('Uploading version json to S3...');
  const newVersionMessage = process.argv[2];
  const json = newVersionMessage
    ? `{"version": "${version}", "changes": "${newVersionMessage}"}`
    : `{"version": "${version}"}`;

  execSync(`echo '${json}' > build/version.json`);

  execSync(
    `aws s3 cp build/version.json ${process.env.S3_URL}/version.json --cache-control max-age=0,no-store`
  );

  if (newVersionMessage) {
    const dbItem = {
      id: { S: 'admin' },
      sortKey: { S: `version_${version}` },
      version: { S: version },
      changes: { S: newVersionMessage },
    };
    execSync(
      `aws dynamodb put-item --table-name ${process.env.DYNAMODB_TABLE} --item "${JSON.stringify(
        dbItem
      ).replace(/"/g, '\\"')}"`
    );
  }

  console.log('Upload version json to S3 completed.');
}
