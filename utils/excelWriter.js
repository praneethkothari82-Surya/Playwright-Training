const ExcelJS = require('exceljs');
const path = require('path');

/**
 * ExcelWriter - Utility for writing/creating Excel files (.xlsx)
 * Uses ExcelJS for rich formatting and Excel generation
 * For reading Excel files, use excelReader.js (SheetJS/xlsx)
 * 
 * @example
 * const { writeExcel, appendToExcel, createWorkbook } = require('./utils/excelWriter');
 * 
 * // Write data to new Excel file
 * await writeExcel('output/results.xlsx', 'TestResults', data);
 * 
 * // Append data to existing sheet
 * await appendToExcel('output/results.xlsx', 'TestResults', newData);
 */

/**
 * Write data to a new Excel file
 * Creates file with headers and data rows
 * 
 * @param {string} filePath - Path where Excel file will be saved
 * @param {string} sheetName - Name of the sheet to create
 * @param {Array<Object>} data - Array of objects to write
 * @param {Object} options - Optional formatting options
 * @returns {Promise<void>}
 * 
 * @example
 * const testResults = [
 *   { testName: 'Login Test', status: 'PASSED', duration: '2.3s' },
 *   { testName: 'Register Test', status: 'FAILED', duration: '1.8s' }
 * ];
 * await writeExcel('output/results.xlsx', 'TestResults', testResults);
 */
async function writeExcel(filePath, sheetName, data, options = {}) {
    try {
        // Create new workbook
        const workbook = new ExcelJS.Workbook();
        
        // Add worksheet
        const worksheet = workbook.addWorksheet(sheetName);
        
        if (data.length === 0) {
            console.log('⚠ No data to write');
            return;
        }
        
        // Get headers from first object
        const headers = Object.keys(data[0]);
        
        // Add header row with formatting
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true, size: 12 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        
        // Add data rows
        data.forEach(row => {
            const values = headers.map(header => row[header]);
            worksheet.addRow(values);
        });
        
        // Auto-fit columns
        worksheet.columns.forEach((column, index) => {
            let maxLength = headers[index].length;
            column.eachCell({ includeEmpty: false }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                if (cellLength > maxLength) {
                    maxLength = cellLength;
                }
            });
            column.width = Math.min(maxLength + 2, 50); // Max width 50
        });
        
        // Add borders to all cells
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
        
        // Resolve absolute path
        const absolutePath = path.resolve(process.cwd(), filePath);
        
        // Create directory if it doesn't exist
        const dir = path.dirname(absolutePath);
        const fs = require('fs');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write file
        await workbook.xlsx.writeFile(absolutePath);
        
        console.log(`✓ Successfully wrote ${data.length} rows to "${sheetName}" in ${filePath}`);
        
    } catch (error) {
        console.error(`✗ Error writing Excel file: ${error.message}`);
        throw error;
    }
}

/**
 * Append data to existing Excel file
 * Adds rows to existing sheet
 * 
 * @param {string} filePath - Path to existing Excel file
 * @param {string} sheetName - Name of the sheet to append to
 * @param {Array<Object>} data - Array of objects to append
 * @returns {Promise<void>}
 * 
 * @example
 * const newResults = [
 *   { testName: 'Logout Test', status: 'PASSED', duration: '0.5s' }
 * ];
 * await appendToExcel('output/results.xlsx', 'TestResults', newResults);
 */
async function appendToExcel(filePath, sheetName, data) {
    try {
        const absolutePath = path.resolve(process.cwd(), filePath);
        
        // Load existing workbook
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(absolutePath);
        
        // Get worksheet
        const worksheet = workbook.getWorksheet(sheetName);
        if (!worksheet) {
            throw new Error(`Sheet "${sheetName}" not found`);
        }
        
        if (data.length === 0) {
            console.log('⚠ No data to append');
            return;
        }
        
        // Get headers from existing sheet
        const headerRow = worksheet.getRow(1);
        const headers = [];
        headerRow.eachCell((cell, colNumber) => {
            headers.push(cell.value);
        });
        
        // Append data rows
        data.forEach(row => {
            const values = headers.map(header => row[header] || '');
            worksheet.addRow(values);
        });
        
        // Write file
        await workbook.xlsx.writeFile(absolutePath);
        
        console.log(`✓ Successfully appended ${data.length} rows to "${sheetName}"`);
        
    } catch (error) {
        console.error(`✗ Error appending to Excel file: ${error.message}`);
        throw error;
    }
}

/**
 * Create Excel file with multiple sheets
 * Each sheet can have different data
 * 
 * @param {string} filePath - Path where Excel file will be saved
 * @param {Array<Object>} sheets - Array of sheet objects with name and data
 * @returns {Promise<void>}
 * 
 * @example
 * await createWorkbook('output/test-report.xlsx', [
 *   { name: 'Passed Tests', data: passedTests },
 *   { name: 'Failed Tests', data: failedTests },
 *   { name: 'Skipped Tests', data: skippedTests }
 * ]);
 */
async function createWorkbook(filePath, sheets) {
    try {
        const workbook = new ExcelJS.Workbook();
        
        for (const sheet of sheets) {
            if (!sheet.name || !sheet.data) {
                console.warn(`⚠ Skipping invalid sheet: ${JSON.stringify(sheet)}`);
                continue;
            }
            
            const worksheet = workbook.addWorksheet(sheet.name);
            
            if (sheet.data.length === 0) {
                console.log(`⚠ No data for sheet "${sheet.name}"`);
                continue;
            }
            
            // Get headers
            const headers = Object.keys(sheet.data[0]);
            
            // Add header row
            const headerRow = worksheet.addRow(headers);
            headerRow.font = { bold: true, size: 12 };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            
            // Add data rows
            sheet.data.forEach(row => {
                const values = headers.map(header => row[header]);
                worksheet.addRow(values);
            });
            
            // Auto-fit columns
            worksheet.columns.forEach((column, index) => {
                let maxLength = headers[index].length;
                column.eachCell({ includeEmpty: false }, cell => {
                    const cellLength = cell.value ? cell.value.toString().length : 0;
                    if (cellLength > maxLength) {
                        maxLength = cellLength;
                    }
                });
                column.width = Math.min(maxLength + 2, 50);
            });
        }
        
        // Resolve path and save
        const absolutePath = path.resolve(process.cwd(), filePath);
        const dir = path.dirname(absolutePath);
        const fs = require('fs');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        await workbook.xlsx.writeFile(absolutePath);
        
        console.log(`✓ Successfully created workbook with ${sheets.length} sheets in ${filePath}`);
        
    } catch (error) {
        console.error(`✗ Error creating workbook: ${error.message}`);
        throw error;
    }
}

/**
 * Write test results to Excel with color-coded status
 * Automatically formats PASSED/FAILED/SKIPPED with colors
 * 
 * @param {string} filePath - Path where Excel file will be saved
 * @param {Array<Object>} testResults - Array of test result objects
 * @returns {Promise<void>}
 * 
 * @example
 * const results = [
 *   { testName: 'Login Test', status: 'PASSED', duration: '2.3s', browser: 'chromium' },
 *   { testName: 'Register Test', status: 'FAILED', duration: '1.8s', browser: 'chromium' }
 * ];
 * await writeTestResults('output/test-results.xlsx', results);
 */
async function writeTestResults(filePath, testResults) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Test Results');
        
        if (testResults.length === 0) {
            console.log('⚠ No test results to write');
            return;
        }
        
        // Add headers
        const headers = Object.keys(testResults[0]);
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true, size: 12 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2F5496' }
        };
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        
        // Add data rows with conditional formatting
        testResults.forEach(result => {
            const values = headers.map(header => result[header]);
            const row = worksheet.addRow(values);
            
            // Color-code based on status
            const statusIndex = headers.indexOf('status') + 1;
            if (statusIndex > 0) {
                const statusCell = row.getCell(statusIndex);
                const status = result.status.toUpperCase();
                
                if (status === 'PASSED') {
                    statusCell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF70AD47' } // Green
                    };
                    statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (status === 'FAILED') {
                    statusCell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFF0000' } // Red
                    };
                    statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (status === 'SKIPPED') {
                    statusCell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFC000' } // Orange
                    };
                    statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                }
            }
        });
        
        // Auto-fit columns
        worksheet.columns.forEach((column, index) => {
            let maxLength = headers[index].length;
            column.eachCell({ includeEmpty: false }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                if (cellLength > maxLength) {
                    maxLength = cellLength;
                }
            });
            column.width = Math.min(maxLength + 2, 50);
        });
        
        // Add borders
        worksheet.eachRow((row) => {
            row.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
        
        // Save file
        const absolutePath = path.resolve(process.cwd(), filePath);
        const dir = path.dirname(absolutePath);
        const fs = require('fs');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        await workbook.xlsx.writeFile(absolutePath);
        
        console.log(`✓ Successfully wrote ${testResults.length} test results to ${filePath}`);
        
    } catch (error) {
        console.error(`✗ Error writing test results: ${error.message}`);
        throw error;
    }
}

module.exports = {
    writeExcel,
    appendToExcel,
    createWorkbook,
    writeTestResults
};
