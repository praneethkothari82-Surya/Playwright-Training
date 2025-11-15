/**
 * Test Data Manager - Thread-Safe Data Access for Parallel Testing
 * 
 * This utility provides thread-safe access to test data across multiple Playwright workers.
 * It prevents race conditions by partitioning data based on worker index and tracking usage.
 * 
 * WHY DO WE NEED THIS?
 * -------------------
 * When running tests in parallel with multiple workers:
 * - Multiple tests might try to use the same test data simultaneously
 * - This causes "duplicate email" or "user already exists" errors
 * - Data conflicts lead to test failures and unpredictable results
 * 
 * HOW IT WORKS:
 * ------------
 * 1. Data is loaded once and shared across all workers
 * 2. Each worker gets a unique subset of data based on worker index
 * 3. Used data is tracked to prevent reuse within same test run
 * 4. Automatic data validation and error handling
 * 
 * @example
 * const { TestDataManager } = require('../utils/testDataManager');
 * 
 * let dataManager;
 * 
 * test.beforeAll(async () => {
 *     dataManager = new TestDataManager('testdata/users.csv');
 *     await dataManager.loadData();
 * });
 * 
 * test('Register user', async ({ page }, testInfo) => {
 *     const user = dataManager.getUniqueData(testInfo.parallelIndex);
 *     // Use user data for registration
 * });
 */

const { readCSV } = require('./csvReader');
const { readExcel } = require('./excelReader');
const path = require('path');

class TestDataManager {
    /**
     * Initialize Test Data Manager
     * 
     * @param {string} filePath - Path to data file (CSV or Excel)
     * @param {Object} options - Configuration options
     * @param {string} options.sheetName - Sheet name for Excel files (optional)
     * @param {string} options.dataType - 'csv' or 'excel' (auto-detected from extension)
     * @param {number} options.dataPerWorker - Number of data items per worker (default: 10)
     * 
     * @example
     * // CSV file
     * const manager = new TestDataManager('testdata/users.csv');
     * 
     * // Excel file with specific sheet
     * const manager = new TestDataManager('testdata/users.xlsx', { sheetName: 'Users' });
     * 
     * // Custom data allocation
     * const manager = new TestDataManager('testdata/users.csv', { dataPerWorker: 5 });
     */
    constructor(filePath, options = {}) {
        this.filePath = filePath;
        this.sheetName = options.sheetName || null;
        this.dataPerWorker = options.dataPerWorker || 10;
        
        // Auto-detect file type from extension
        const ext = path.extname(filePath).toLowerCase();
        this.dataType = options.dataType || (ext === '.xlsx' || ext === '.xls' ? 'excel' : 'csv');
        
        // Internal data storage
        this.allData = [];          // All loaded data
        this.usedIndices = new Set(); // Track used data indices
        this.workerData = new Map(); // Cache data per worker
        
        console.log(`📊 TestDataManager initialized for: ${filePath}`);
        console.log(`   Type: ${this.dataType.toUpperCase()}`);
        console.log(`   Data per worker: ${this.dataPerWorker}`);
    }

    /**
     * Load data from file
     * Call this in test.beforeAll() to load data once for all tests
     * 
     * @returns {Promise<Array>} Loaded data
     * @throws {Error} If file cannot be loaded
     * 
     * @example
     * test.beforeAll(async () => {
     *     await dataManager.loadData();
     *     console.log(`Loaded ${dataManager.getDataCount()} records`);
     * });
     */
    async loadData() {
        try {
            console.log(`📂 Loading data from: ${this.filePath}`);
            
            if (this.dataType === 'excel') {
                this.allData = await readExcel(this.filePath, this.sheetName);
            } else {
                this.allData = await readCSV(this.filePath);
            }
            
            console.log(`✅ Loaded ${this.allData.length} records successfully`);
            return this.allData;
        } catch (error) {
            console.error(`❌ Failed to load data from ${this.filePath}:`, error.message);
            throw error;
        }
    }

    /**
     * Get unique data for a specific worker
     * Each worker gets its own subset of data to prevent conflicts
     * 
     * WORKER DATA PARTITIONING:
     * ------------------------
     * Worker 0: indices 0-9   (if dataPerWorker=10)
     * Worker 1: indices 10-19
     * Worker 2: indices 20-29
     * And so on...
     * 
     * @param {number} workerIndex - Worker index from testInfo.parallelIndex
     * @param {number} offset - Optional offset within worker's data range (default: 0)
     * @returns {Object|null} Data object or null if no data available
     * 
     * @example
     * test('Register user', async ({ page }, testInfo) => {
     *     // Get first data item for this worker
     *     const user = dataManager.getUniqueData(testInfo.parallelIndex);
     *     
     *     // Get second data item for this worker
     *     const user2 = dataManager.getUniqueData(testInfo.parallelIndex, 1);
     * });
     */
    getUniqueData(workerIndex, offset = 0) {
        // Calculate starting index for this worker
        const startIndex = workerIndex * this.dataPerWorker;
        const dataIndex = startIndex + offset;
        
        // Validate index is within bounds
        if (dataIndex >= this.allData.length) {
            console.warn(`⚠️ Worker ${workerIndex}: No data at index ${dataIndex} (total: ${this.allData.length})`);
            return null;
        }
        
        // Check if this data was already used
        if (this.usedIndices.has(dataIndex)) {
            console.warn(`⚠️ Worker ${workerIndex}: Data at index ${dataIndex} was already used`);
            // Try next available data in worker's range
            for (let i = 0; i < this.dataPerWorker; i++) {
                const altIndex = startIndex + i;
                if (altIndex < this.allData.length && !this.usedIndices.has(altIndex)) {
                    console.log(`   ↪️ Using alternative index: ${altIndex}`);
                    this.usedIndices.add(altIndex);
                    return { ...this.allData[altIndex], _dataIndex: altIndex };
                }
            }
            return null;
        }
        
        // Mark as used and return data
        this.usedIndices.add(dataIndex);
        const data = this.allData[dataIndex];
        
        console.log(`✓ Worker ${workerIndex}: Assigned data index ${dataIndex}`);
        
        // Return copy with metadata
        return {
            ...data,
            _dataIndex: dataIndex,
            _workerIndex: workerIndex
        };
    }

    /**
     * Get multiple unique data items for a worker
     * Useful when a single test needs multiple data records
     * 
     * @param {number} workerIndex - Worker index from testInfo.parallelIndex
     * @param {number} count - Number of data items to retrieve
     * @returns {Array<Object>} Array of data objects
     * 
     * @example
     * test('Register multiple users', async ({ page }, testInfo) => {
     *     // Get 3 unique users for this worker
     *     const users = dataManager.getMultipleData(testInfo.parallelIndex, 3);
     *     
     *     for (const user of users) {
     *         await registerPage.register(user);
     *     }
     * });
     */
    getMultipleData(workerIndex, count) {
        const results = [];
        
        for (let i = 0; i < count; i++) {
            const data = this.getUniqueData(workerIndex, i);
            if (data) {
                results.push(data);
            } else {
                console.warn(`⚠️ Could only retrieve ${results.length} of ${count} requested items`);
                break;
            }
        }
        
        return results;
    }

    /**
     * Get filtered data based on criteria
     * Returns data that matches the filter condition
     * 
     * @param {Object} filter - Filter criteria (key-value pairs)
     * @returns {Array<Object>} Filtered data array
     * 
     * @example
     * // Get all active users
     * const activeUsers = dataManager.getFilteredData({ status: 'active' });
     * 
     * // Get all premium female users
     * const premiumFemales = dataManager.getFilteredData({ 
     *     accountType: 'premium',
     *     gender: 'female'
     * });
     */
    getFilteredData(filter) {
        return this.allData.filter(item => {
            return Object.entries(filter).every(([key, value]) => {
                return item[key] === value;
            });
        });
    }

    /**
     * Get data by index (direct access)
     * Use this when you need specific data by index
     * 
     * @param {number} index - Data index
     * @param {boolean} markAsUsed - Whether to mark as used (default: true)
     * @returns {Object|null} Data object or null if index invalid
     * 
     * @example
     * // Get specific user by index
     * const user = dataManager.getDataByIndex(5);
     * 
     * // Get without marking as used (for read-only operations)
     * const user = dataManager.getDataByIndex(5, false);
     */
    getDataByIndex(index, markAsUsed = true) {
        if (index < 0 || index >= this.allData.length) {
            console.warn(`⚠️ Invalid index: ${index} (valid range: 0-${this.allData.length - 1})`);
            return null;
        }
        
        if (markAsUsed) {
            this.usedIndices.add(index);
        }
        
        return { ...this.allData[index], _dataIndex: index };
    }

    /**
     * Reset used data tracking
     * Call this if you want to reuse data (e.g., between test suites)
     * 
     * @example
     * test.afterAll(() => {
     *     dataManager.resetUsedData();
     * });
     */
    resetUsedData() {
        console.log(`🔄 Resetting used data tracking (${this.usedIndices.size} items were used)`);
        this.usedIndices.clear();
    }

    /**
     * Get total count of loaded data
     * @returns {number} Total data count
     */
    getDataCount() {
        return this.allData.length;
    }

    /**
     * Get count of available (unused) data
     * @returns {number} Available data count
     */
    getAvailableCount() {
        return this.allData.length - this.usedIndices.size;
    }

    /**
     * Get statistics about data usage
     * @returns {Object} Statistics object
     * 
     * @example
     * const stats = dataManager.getStats();
     * console.log(`Total: ${stats.total}, Used: ${stats.used}, Available: ${stats.available}`);
     */
    getStats() {
        return {
            total: this.allData.length,
            used: this.usedIndices.size,
            available: this.allData.length - this.usedIndices.size,
            usagePercent: ((this.usedIndices.size / this.allData.length) * 100).toFixed(2)
        };
    }

    /**
     * Print current data usage statistics
     * Useful for debugging and monitoring
     * 
     * @example
     * test.afterAll(() => {
     *     dataManager.printStats();
     * });
     */
    printStats() {
        const stats = this.getStats();
        console.log('\n📊 Test Data Usage Statistics:');
        console.log(`   Total Records: ${stats.total}`);
        console.log(`   Used Records: ${stats.used}`);
        console.log(`   Available Records: ${stats.available}`);
        console.log(`   Usage: ${stats.usagePercent}%\n`);
    }
}

module.exports = { TestDataManager };
