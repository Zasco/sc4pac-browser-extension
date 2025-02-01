/**
 * Post "npm install" script
 * 
 * Creates a "vendor/" folder that symlinks "node_modules/".
 * This is needed because the project expects dependencies to be located in the "vendor/" directory.
 *
 * Runs automatically after npm install.
 */

import { existsSync } from 'fs';
import { symlink } from 'fs/promises';

import PATHS from './config/paths.js';

if (existsSync(PATHS.NODE) && !existsSync(PATHS.VENDOR)) {
    // The use of "junction" here is to avoid admin permission requirement for standard symlinks in Windows.
    await symlink(PATHS.NODE, PATHS.VENDOR, 'junction');
    console.log(`"${PATHS.VENDOR}" folder (symlink of "${PATHS.NODE}") created.`);
}