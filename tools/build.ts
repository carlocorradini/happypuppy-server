/* eslint-disable import/no-extraneous-dependencies */
import shell from 'shelljs';

const BUILD_FOLDER = './build/';

const FOLDERS = new Set(['./src/public', './src/docs']);
const FILES = new Set(['LICENSE', 'README.md', 'package.json', 'package-lock.json']);

// Copy Folders
FOLDERS.forEach((folder) => {
  shell.cp('-R', folder, BUILD_FOLDER);
});

// Copy Files
FILES.forEach((file) => {
  shell.cp(file, BUILD_FOLDER);
});
