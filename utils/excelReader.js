const XLSX = require('xlsx');
const path = require('path');

/**
 * ExcelReader - Utility for reading data from Excel files (.xlsx, .xls)
 * Uses SheetJS (xlsx) for fast reading and parsing
 * ExcelJS can be used separately for writing/generating Excel files
 * Provides dynamic data access from Excel sheets
 * 
 * @example
 * const { readExcel, readExcelByRow, readExcelByColumn, getAllSheets } = require('./utils/excelReader');
 * 
 * // Read all data from a sheet
 * const data = await readExcel('testdata/users.xlsx', 'Sheet1');
 * 
 * // Read specific row
 * const row = await readExcelByRow('testdata/users.xlsx', 'Sheet1', 2);
 * 
 * // Read specific column
 * const emails = await readExcelByColumn('testdata/users.xlsx', 'Sheet1', 'email');
 */

/**
 * Read all data from an Excel sheet
 * Returns data as an array of objects with headers as keys
 * 
 * @param {string} filePath - Path to Excel file (relative to project root)
 * @param {string} sheetName - Name of the sheet to read (optional, defaults to first sheet)
 * @returns {Promise<Array<Object>>} Array of row objects
 * @throws {Error} If file doesn't exist or sheet not found
 * 
 * @example
 * const data = await readExcel('testdata/users.xlsx', 'Users');
 * // Returns: [
 * //   { username: 'john', email: 'john@test.com', password: 'Pass123' },
 * //   { username: 'jane', email: 'jane@test.com', password: 'Pass456' }
 * // ]
 */
async function readExcel(filePath, sheetName = null) {
    try {
        // Resolve absolute path
        const absolutePath = path.resolve(process.cwd(), filePath);
        
        // Read the workbook
        const workbook = XLSX.readFile(absolutePath);
        
        // Get sheet name (use provided or first sheet)
        const sheet = sheetName || workbook.SheetNames[0];
        
        // Check if sheet exists
        if (!workbook.SheetNames.includes(sheet)) {
            throw new Error(`Sheet "${sheet}" not found. Available sheets: ${workbook.SheetNames.join(', ')}`);
        }
        
        // Get worksheet
        const worksheet = workbook.Sheets[sheet];
        
        // Convert to JSON (array of objects)
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`✓ Successfully read ${data.length} rows from "${sheet}" in ${filePath}`);
        return data;
        
    } catch (error) {
        console.error(`✗ Error reading Excel file: ${error.message}`);
        throw error;
    }
}

/**
 * Read a specific row from an Excel sheet
 * Row index is 1-based (excluding header row)
 * 
 * @param {string} filePath - Path to Excel file
 * @param {string} sheetName - Name of the sheet
 * @param {number} rowIndex - Row number to read (1-based, excluding header)
 * @returns {Promise<Object>} Row data as object
 * @throws {Error} If row doesn't exist
 * 
 * @example
 * const row = await readExcelByRow('testdata/users.xlsx', 'Users', 1);
 * // Returns: { username: 'john', email: 'john@test.com', password: 'Pass123' }
 */
async function readExcelByRow(filePath, sheetName, rowIndex) {
    try {
        const data = await readExcel(filePath, sheetName);
        
        // Adjust index (array is 0-based, but we want 1-based for users)
        const row = data[rowIndex - 1];
        
        if (!row) {
            throw new Error(`Row ${rowIndex} not found. Sheet has ${data.length} rows.`);
        }
        
        console.log(`✓ Read row ${rowIndex} from "${sheetName}"`);
        return row;
        
    } catch (error) {
        console.error(`✗ Error reading row: ${error.message}`);
        throw error;
    }
}

/**
 * Read a specific column from an Excel sheet
 * Returns all values from the specified column
 * 
 * @param {string} filePath - Path to Excel file
 * @param {string} sheetName - Name of the sheet
 * @param {string} columnName - Name of the column (header name)
 * @returns {Promise<Array>} Array of column values
 * @throws {Error} If column doesn't exist
 * 
 * @example
 * const emails = await readExcelByColumn('testdata/users.xlsx', 'Users', 'email');
 * // Returns: ['john@test.com', 'jane@test.com', 'bob@test.com']
 */
async function readExcelByColumn(filePath, sheetName, columnName) {
    try {
        const data = await readExcel(filePath, sheetName);
        
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
 * Get all sheet names from an Excel file
 * 
 * @param {string} filePath - Path to Excel file
 * @returns {Promise<Array<string>>} Array of sheet names
 * 
 * @example
 * const sheets = await getAllSheets('testdata/users.xlsx');
 * // Returns: ['Users', 'AdminUsers', 'TestData']
 */
async function getAllSheets(filePath) {
    try {
        const absolutePath = path.resolve(process.cwd(), filePath);
        const workbook = XLSX.readFile(absolutePath);
        
        console.log(`✓ Found ${workbook.SheetNames.length} sheets in ${filePath}`);
        console.log(`  Sheets: ${workbook.SheetNames.join(', ')}`);
        
        return workbook.SheetNames;
        
    } catch (error) {
        console.error(`✗ Error reading Excel file: ${error.message}`);
        throw error;
    }
}

/**
 * Find rows that match specific criteria
 * Search for rows where column values match the provided filters
 * 
 * @param {string} filePath - Path to Excel file
 * @param {string} sheetName - Name of the sheet
 * @param {Object} criteria - Object with column:value pairs to match
 * @returns {Promise<Array<Object>>} Array of matching rows
 * 
 * @example
 * const activeUsers = await findRows('testdata/users.xlsx', 'Users', { status: 'active' });
 * // Returns all rows where status column equals 'active'
 * 
 * const johnDoe = await findRows('testdata/users.xlsx', 'Users', { 
 *   firstName: 'John', 
 *   lastName: 'Doe' 
 * });
 * // Returns rows matching both conditions
 */
async function findRows(filePath, sheetName, criteria) {
    try {
        const data = await readExcel(filePath, sheetName);
        
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
 * Get row count from an Excel sheet
 * 
 * @param {string} filePath - Path to Excel file
 * @param {string} sheetName - Name of the sheet
 * @returns {Promise<number>} Number of rows (excluding header)
 * 
 * @example
 * const count = await getRowCount('testdata/users.xlsx', 'Users');
 * console.log(`Total users: ${count}`);
 */
async function getRowCount(filePath, sheetName) {
    try {
        const data = await readExcel(filePath, sheetName);
        return data.length;
    } catch (error) {
        console.error(`✗ Error getting row count: ${error.message}`);
        throw error;
    }
}

/**
 * Get column headers from an Excel sheet
 * 
 * @param {string} filePath - Path to Excel file
 * @param {string} sheetName - Name of the sheet
 * @returns {Promise<Array<string>>} Array of column header names
 * 
 * @example
 * const headers = await getHeaders('testdata/users.xlsx', 'Users');
 * // Returns: ['username', 'email', 'password', 'status']
 */
async function getHeaders(filePath, sheetName) {
    try {
        const data = await readExcel(filePath, sheetName);
        
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

module.exports = {
    readExcel,
    readExcelByRow,
    readExcelByColumn,
    getAllSheets,
    findRows,
    getRowCount,
    getHeaders
};
