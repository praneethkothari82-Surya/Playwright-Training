const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/**
 * CSVReader - Utility for reading data from CSV files
 * Provides dynamic data access from CSV files with various parsing options
 * 
 * @example
 * const { readCSV, readCSVByRow, readCSVByColumn, findRows } = require('./utils/csvReader');
 * 
 * // Read all data from CSV
 * const data = await readCSV('testdata/users.csv');
 * 
 * // Read specific row
 * const row = await readCSVByRow('testdata/users.csv', 3);
 * 
 * // Read specific column
 * const emails = await readCSVByColumn('testdata/users.csv', 'email');
 */

/**
 * Read all data from a CSV file
 * Returns data as an array of objects with headers as keys
 * 
 * @param {string} filePath - Path to CSV file (relative to project root)
 * @param {Object} options - Parsing options
 * @param {string} options.delimiter - Column delimiter (default: ',')
 * @param {boolean} options.headers - Whether first row is headers (default: true)
 * @param {string} options.encoding - File encoding (default: 'utf-8')
 * @returns {Promise<Array<Object>>} Array of row objects
 * @throws {Error} If file doesn't exist or parsing fails
 * 
 * @example
 * // Standard CSV with comma delimiter
 * const data = await readCSV('testdata/users.csv');
 * // Returns: [
 * //   { username: 'john', email: 'john@test.com', password: 'Pass123' },
 * //   { username: 'jane', email: 'jane@test.com', password: 'Pass456' }
 * // ]
 * 
 * // Tab-delimited file
 * const data = await readCSV('testdata/users.tsv', { delimiter: '\t' });
 * 
 * // Semicolon-delimited (common in European CSVs)
 * const data = await readCSV('testdata/users.csv', { delimiter: ';' });
 */
async function readCSV(filePath, options = {}) {
    try {
        // Default options
        const defaultOptions = {
            delimiter: ',',
            headers: true,
            encoding: 'utf-8'
        };
        
        const parseOptions = { ...defaultOptions, ...options };
        
        // Resolve absolute path
        const absolutePath = path.resolve(process.cwd(), filePath);
        
        // Check if file exists
        if (!fs.existsSync(absolutePath)) {
            throw new Error(`File not found: ${absolutePath}`);
        }
        
        // Read file content
        const fileContent = fs.readFileSync(absolutePath, parseOptions.encoding);
        
        // Parse CSV
        const data = parse(fileContent, {
            columns: parseOptions.headers,
            skip_empty_lines: true,
            trim: true,
            delimiter: parseOptions.delimiter,
            relax_column_count: true // Allow inconsistent column counts
        });
        
        console.log(`✓ Successfully read ${data.length} rows from ${filePath}`);
        return data;
        
    } catch (error) {
        console.error(`✗ Error reading CSV file: ${error.message}`);
        throw error;
    }
}

/**
 * Read a specific row from a CSV file
 * Row index is 1-based (excluding header row)
 * 
 * @param {string} filePath - Path to CSV file
 * @param {number} rowIndex - Row number to read (1-based, excluding header)
 * @param {Object} options - Parsing options (same as readCSV)
 * @returns {Promise<Object>} Row data as object
 * @throws {Error} If row doesn't exist
 * 
 * @example
 * const row = await readCSVByRow('testdata/users.csv', 1);
 * // Returns: { username: 'john', email: 'john@test.com', password: 'Pass123' }
 * 
 * const row5 = await readCSVByRow('testdata/users.csv', 5);
 */
async function readCSVByRow(filePath, rowIndex, options = {}) {
    try {
        const data = await readCSV(filePath, options);
        
        // Adjust index (array is 0-based, but we want 1-based for users)
        const row = data[rowIndex - 1];
        
        if (!row) {
            throw new Error(`Row ${rowIndex} not found. CSV has ${data.length} rows.`);
        }
        
        console.log(`✓ Read row ${rowIndex} from ${filePath}`);
        return row;
        
    } catch (error) {
        console.error(`✗ Error reading row: ${error.message}`);
        throw error;
    }
}

/**
 * Read a specific column from a CSV file
 * Returns all values from the specified column
 * 
 * @param {string} filePath - Path to CSV file
 * @param {string} columnName - Name of the column (header name)
 * @param {Object} options - Parsing options (same as readCSV)
 * @returns {Promise<Array>} Array of column values
 * @throws {Error} If column doesn't exist
 * 
 * @example
 * const emails = await readCSVByColumn('testdata/users.csv', 'email');
 * // Returns: ['john@test.com', 'jane@test.com', 'bob@test.com']
 * 
 * const usernames = await readCSVByColumn('testdata/users.csv', 'username');
 * // Returns: ['john', 'jane', 'bob']
 */
async function readCSVByColumn(filePath, columnName, options = {}) {
    try {
        const data = await readCSV(filePath, options);
        
        // Check if column exists
        if (data.length > 0 && !(columnName in data[0])) {
            const availableColumns = Object.keys(data[0]);
            throw new Error(`Column "${columnName}" not found. Available columns: ${availableColumns.join(', ')}`);
        }
        
        // Extract column values
        const columnValues = data.map(row => row[columnName]);
        
        console.log(`✓ Read ${columnValues.length} values from column "${columnName}"`);
        return columnValues;
        
    } catch (error) {
        console.error(`✗ Error reading column: ${error.message}`);
        throw error;
    }
}

/**
 * Find rows that match specific criteria
 * Search for rows where column values match the provided filters
 * 
 * @param {string} filePath - Path to CSV file
 * @param {Object} criteria - Object with column:value pairs to match
 * @param {Object} options - Parsing options (same as readCSV)
 * @returns {Promise<Array<Object>>} Array of matching rows
 * 
 * @example
 * const activeUsers = await findRows('testdata/users.csv', { status: 'active' });
 * // Returns all rows where status column equals 'active'
 * 
 * const johnDoe = await findRows('testdata/users.csv', { 
 *   firstName: 'John', 
 *   lastName: 'Doe' 
 * });
 * // Returns rows matching both conditions
 * 
 * const premiumUsers = await findRows('testdata/users.csv', { 
 *   plan: 'premium',
 *   status: 'active'
 * });
 */
async function findRows(filePath, criteria, options = {}) {
    try {
        const data = await readCSV(filePath, options);
        
        // Filter rows based on criteria
        const matchingRows = data.filter(row => {
            return Object.keys(criteria).every(key => {
                return row[key] === criteria[key];
            });
        });
        
        console.log(`✓ Found ${matchingRows.length} matching rows`);
        return matchingRows;
        
    } catch (error) {
        console.error(`✗ Error finding rows: ${error.message}`);
        throw error;
    }
}

/**
 * Get row count from a CSV file
 * 
 * @param {string} filePath - Path to CSV file
 * @param {Object} options - Parsing options (same as readCSV)
 * @returns {Promise<number>} Number of rows (excluding header)
 * 
 * @example
 * const count = await getRowCount('testdata/users.csv');
 * console.log(`Total users: ${count}`);
 */
async function getRowCount(filePath, options = {}) {
    try {
        const data = await readCSV(filePath, options);
        return data.length;
    } catch (error) {
        console.error(`✗ Error getting row count: ${error.message}`);
        throw error;
    }
}

/**
 * Get column headers from a CSV file
 * 
 * @param {string} filePath - Path to CSV file
 * @param {Object} options - Parsing options (same as readCSV)
 * @returns {Promise<Array<string>>} Array of column header names
 * 
 * @example
 * const headers = await getHeaders('testdata/users.csv');
 * // Returns: ['username', 'email', 'password', 'status']
 */
async function getHeaders(filePath, options = {}) {
    try {
        const data = await readCSV(filePath, options);
        
        if (data.length === 0) {
            return [];
        }
        
        const headers = Object.keys(data[0]);
        console.log(`✓ Headers: ${headers.join(', ')}`);
        
        return headers;
        
    } catch (error) {
        console.error(`✗ Error getting headers: ${error.message}`);
        throw error;
    }
}

/**
 * Read CSV without headers (returns array of arrays)
 * Useful for CSV files without header row
 * 
 * @param {string} filePath - Path to CSV file
 * @param {Object} options - Parsing options
 * @returns {Promise<Array<Array>>} Array of row arrays
 * 
 * @example
 * const data = await readCSVRaw('testdata/data.csv');
 * // Returns: [
 * //   ['john', 'john@test.com', 'Pass123'],
 * //   ['jane', 'jane@test.com', 'Pass456']
 * // ]
 */
async function readCSVRaw(filePath, options = {}) {
    try {
        const rawOptions = { ...options, headers: false };
        const data = await readCSV(filePath, rawOptions);
        
        console.log(`✓ Read ${data.length} rows (raw format)`);
        return data;
        
    } catch (error) {
        console.error(`✗ Error reading CSV raw: ${error.message}`);
        throw error;
    }
}

/**
 * Get unique values from a column
 * Returns array of distinct values (no duplicates)
 * 
 * @param {string} filePath - Path to CSV file
 * @param {string} columnName - Name of the column
 * @param {Object} options - Parsing options (same as readCSV)
 * @returns {Promise<Array>} Array of unique values
 * 
 * @example
 * const countries = await getUniqueValues('testdata/users.csv', 'country');
 * // Returns: ['USA', 'Canada', 'UK', 'Australia']
 */
async function getUniqueValues(filePath, columnName, options = {}) {
    try {
        const columnValues = await readCSVByColumn(filePath, columnName, options);
        const uniqueValues = [...new Set(columnValues)];
        
        console.log(`✓ Found ${uniqueValues.length} unique values in "${columnName}"`);
        return uniqueValues;
        
    } catch (error) {
        console.error(`✗ Error getting unique values: ${error.message}`);
        throw error;
    }
}

module.exports = {
    readCSV,
    readCSVByRow,
    readCSVByColumn,
    findRows,
    getRowCount,
    getHeaders,
    readCSVRaw,
    getUniqueValues
};
