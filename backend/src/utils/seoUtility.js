const { exec } = require('child_process');
const path = require('path');

const triggerSEOUpdate = () => {
    try {
        // Resolve path to the script in the root scripts folder
        // This utility is in backend/src/utils/seoUtility.js
        // Project root is ../../../
        const scriptPath = path.resolve(__dirname, '../../../scripts/auto_push_master.sh');

        console.log('🔄 Triggering auto-push and SEO regeneration...');

        // Check if we are on Windows to try running with bash if possible, or just execute
        const command = process.platform === 'win32' ? `bash "${scriptPath}"` : `"${scriptPath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Auto-push execution error: ${error.message}`);
                return;
            }
            if (stderr) {
                // git push usually writes to stderr, so we log it but don't treat as fatal error unless exit code was non-zero
                console.log(`⚠️ Auto-push stderr: ${stderr}`);
            }
            console.log(`✅ Auto-push output: ${stdout}`);
        });
    } catch (err) {
        console.error('❌ Failed to trigger auto-push:', err);
    }
};

module.exports = { triggerSEOUpdate };
