import { execSync } from 'child_process';

const windowsScript = 'scripts\\postInstall.bat';
const unixScript = './scripts/postInstall.sh';

const isWindows = process.platform === 'win32';
const command = isWindows 
    ? `cmd /c "${windowsScript}"`
    : `sh ${unixScript}`
;

execSync(command, {stdio: 'inherit'});