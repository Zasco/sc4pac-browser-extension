/**
 * Custom "npm link <package-name>" script
 * 
 * This script replaces NPM's standard link (symlink) behavior with actual file copies.
 * It's useful when symlinks cause issues, particularly in browser extension
 * where files outside of the extension's directory (even symlinked) aren't accessible.
 * 
 * The script:
 * 1. Takes package names as command line arguments.
 * 2. Finds these packages in the global NPM directory.
 * 3. Removes any existing package in node_modules.
 * 4. Creates a copy of the global package in node_modules.
 * 
 * Why use this instead of npm link:
 * - Avoids symlink-related problems in certain environments.
 * - Ensures consistent behavior across different systems.
 * - Allows modifications to the local copy without affecting the global package.
 * 
 * Usage: node scripts/custom-npm-link.js <package-name1> [package-name2 ...]
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import { rm, cp } from 'fs/promises';

import PATHS from './config/paths.js';

// Get all package names from arguments.
const packageNames = process.argv.slice(2);
// Get the global link location.
const npmRoot = execSync('npm root -g').toString().trim();

for (const packageName of packageNames) {
    (async () => {
        const linkedPackagePath = join(npmRoot, packageName);
        const targetPath = PATHS.NODE + packageName;
        
        if (existsSync(targetPath)) await rm(targetPath, {recursive: true});

        await cp(linkedPackagePath, targetPath, { 
            recursive: true,
            dereference: true
        });

        console.log(`Linked "${packageName}" (copy) in "${PATHS.NODE}".`);
    })();
}