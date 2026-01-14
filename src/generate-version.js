const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.jsx');
const publicPath = path.join(__dirname, '../public/version.json');

try {
  const appContent = fs.readFileSync(appPath, 'utf8');
  // App.jsx 내의 UPDATE_HISTORY 배열에서 첫 번째 id 값을 정규식으로 추출
  const match = appContent.match(/const UPDATE_HISTORY = \[\s*\{\s*id:\s*(\d+)/);
  
  if (match && match[1]) {
    const latestId = parseInt(match[1], 10);
    const versionData = { latestId };
    
    fs.writeFileSync(publicPath, JSON.stringify(versionData, null, 2));
    console.log(`[Version] Updated version.json with latestId: ${latestId}`);
  } else {
    console.error('[Version] Could not find UPDATE_HISTORY id in App.jsx');
  }
} catch (err) {
  console.error('[Version] Error generating version.json:', err);
}