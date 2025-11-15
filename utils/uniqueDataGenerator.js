/**
 * UNIQUE DATA GENERATOR
 * =====================
 * Ensures absolute uniqueness for test data generation across parallel workers
 * Uses timestamps, worker IDs, UUIDs, and counters to prevent collisions
 */

class UniqueDataGenerator {
    constructor() {
        this.counter = 0;
        this.usedEmails = new Set();
        this.usedUsernames = new Set();
    }

    /**
     * Generate a guaranteed unique email address
     * Format: worker-{workerId}-{timestamp}-{counter}@test{random}.com
     * @param {number} workerId - Playwright worker ID
     * @returns {string} Unique email address
     */
    generateUniqueEmail(workerId = 0) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        this.counter++;
        
        const email = `worker-${workerId}-${timestamp}-${this.counter}@test${random}.com`;
        
        // Double-check uniqueness (shouldn't be needed but extra safety)
        if (this.usedEmails.has(email)) {
            return this.generateUniqueEmail(workerId); // Recursive retry
        }
        
        this.usedEmails.add(email);
        return email;
    }

    /**
     * Generate unique email with custom prefix
     * @param {string} prefix - Custom prefix for email
     * @param {number} workerId - Playwright worker ID
     * @returns {string} Unique email address
     */
    generateUniqueEmailWithPrefix(prefix, workerId = 0) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        this.counter++;
        
        return `${prefix}-w${workerId}-${timestamp}-${this.counter}-${random}@testdomain.com`;
    }

    /**
     * Generate unique username
     * @param {string} baseUsername - Base username
     * @param {number} workerId - Playwright worker ID
     * @returns {string} Unique username
     */
    generateUniqueUsername(baseUsername, workerId = 0) {
        const timestamp = Date.now();
        this.counter++;
        
        const username = `${baseUsername}_w${workerId}_${timestamp}_${this.counter}`;
        
        if (this.usedUsernames.has(username)) {
            return this.generateUniqueUsername(baseUsername, workerId);
        }
        
        this.usedUsernames.add(username);
        return username;
    }

    /**
     * Generate UUID v4
     * @returns {string} UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Generate unique test user data
     * @param {number} workerId - Playwright worker ID
     * @param {string} prefix - Optional prefix for names
     * @returns {Object} Complete user data object
     */
    generateUniqueUser(workerId = 0, prefix = 'user') {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        this.counter++;
        
        return {
            firstName: `${prefix}_first_${workerId}_${this.counter}`,
            lastName: `${prefix}_last_${timestamp}`,
            email: this.generateUniqueEmail(workerId),
            password: `Pass_${timestamp}_${random}!`,
            username: this.generateUniqueUsername(prefix, workerId),
            id: this.generateUUID()
        };
    }

    /**
     * Generate unique phone number
     * @param {number} workerId - Worker ID
     * @returns {string} Unique phone number
     */
    generateUniquePhone(workerId = 0) {
        const timestamp = Date.now().toString().slice(-8);
        this.counter++;
        
        return `555${workerId}${timestamp.slice(0, 4)}${String(this.counter).padStart(4, '0')}`;
    }

    /**
     * Reset internal state (useful for test cleanup)
     */
    reset() {
        this.counter = 0;
        this.usedEmails.clear();
        this.usedUsernames.clear();
    }

    /**
     * Get statistics about generated data
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            counter: this.counter,
            uniqueEmailsGenerated: this.usedEmails.size,
            uniqueUsernamesGenerated: this.usedUsernames.size
        };
    }
}

// Export singleton instance for shared state across imports
const uniqueDataGenerator = new UniqueDataGenerator();

module.exports = { UniqueDataGenerator, uniqueDataGenerator };
