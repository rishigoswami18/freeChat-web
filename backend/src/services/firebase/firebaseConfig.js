/**
 * Firebase Configuration Utility
 * Handles secure parsing of service accounts from various formats.
 */

export const parseServiceAccount = (key) => {
    if (!key) return null;

    try {
        let json;
        
        // 1. Check if it's Base64 encoded (Modern/Secure)
        if (key.length > 500 && !key.trim().startsWith('{')) {
            const decoded = Buffer.from(key, 'base64').toString('utf-8');
            json = JSON.parse(decoded);
        } else {
            // 2. Standard JSON string (handle quoting issues)
            let cleanKey = key.trim();
            if ((cleanKey.startsWith("'") && cleanKey.endsWith("'")) ||
                (cleanKey.startsWith('"') && cleanKey.endsWith('"'))) {
                cleanKey = cleanKey.slice(1, -1);
            }
            json = JSON.parse(cleanKey);
        }

        // 3. Normalize Private Key (Handle newline escaping)
        if (json.private_key) {
            json.private_key = json.private_key
                .replace(/\\n/g, '\n')
                .replace(/\r\n/g, '\n')
                .trim();
            
            if (!json.private_key.endsWith('-----END PRIVATE KEY-----')) {
                json.private_key += '\n-----END PRIVATE KEY-----\n';
            }
        }

        // 4. Validate Required Keys
        const required = ['project_id', 'private_key', 'client_email'];
        const missing = required.filter(k => !json[k]);
        if (missing.length > 0) {
            throw new Error(`Missing required service account keys: ${missing.join(', ')}`);
        }

        return json;
    } catch (error) {
        console.error(`[FirebaseConfig] Critical: Failed to parse service account for ${key.substring(0, 15)}... Error:`, error.message);
        return null;
    }
};
