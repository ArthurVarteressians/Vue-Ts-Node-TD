// npm install semver --save-dev
// npm install --save-dev @types/semver
import semver from 'semver';

const requiredVersion: string = '20.18.0'; // This can be modified to a specific version if needed
const currentVersion: string = process.versions.node; // Directly access the global process variable

if (!semver.satisfies(currentVersion, requiredVersion)) {
    console.error(`Node.js version ${currentVersion} is outdated. Please update to the latest version.`);
    process.exit(1); // Exit with a failure code
}
