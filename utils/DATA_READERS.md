# Data Reader Utilities - Documentation

## Overview

This project includes two powerful utilities for reading test data dynamically from Excel and CSV files:
- **`excelReader.js`** - Read data from Excel files (.xlsx, .xls)
- **`csvReader.js`** - Read data from CSV files (.csv, .tsv)

---

## Installation

### Required Dependencies

Install the necessary packages:

```bash
npm install xlsx csv-parse
```

Or add to `package.json`:
```json
{
  "dependencies": {
    "xlsx": "^0.18.5",
    "csv-parse": "^5.5.0"
  }
}
```

---

## File Structure

```
Playwright Training/
├── utils/
│   ├── excelReader.js      ✅ Excel data reader
│   ├── csvReader.js         ✅ CSV data reader
│   └── DATA_READERS.md      📚 This documentation
├── testdata/
│   ├── users.csv            📄 Sample CSV file
│   └── users.xlsx           📄 Sample Excel file (create manually)
└── tests/
    └── data-driven.spec.js  🧪 Example usage
```

---

## CSV Reader (`csvReader.js`)

### Import

```javascript
const { 
    readCSV, 
    readCSVByRow, 
    readCSVByColumn, 
    findRows,
    getHeaders,
    getRowCount,
    getUniqueValues
} = require('../utils/csvReader');
```

### Functions

#### 1. `readCSV(filePath, options)`
Read all data from a CSV file.

**Parameters:**
- `filePath` (string) - Path relative to project root
- `options` (object, optional):
  - `delimiter` - Column separator (default: `','`)
  - `headers` - First row is headers (default: `true`)
  - `encoding` - File encoding (default: `'utf-8'`)

**Returns:** Array of objects (rows)

**Example:**
```javascript
// Standard comma-delimited CSV
const users = await readCSV('testdata/users.csv');
console.log(users);
// [
//   { username: 'john', email: 'john@test.com', password: 'Pass123' },
//   { username: 'jane', email: 'jane@test.com', password: 'Pass456' }
// ]

// Tab-delimited file
const data = await readCSV('testdata/data.tsv', { delimiter: '\t' });

// Semicolon-delimited (European format)
const data = await readCSV('testdata/euro.csv', { delimiter: ';' });
```

---

#### 2. `readCSVByRow(filePath, rowIndex, options)`
Read a specific row from CSV.

**Parameters:**
- `filePath` (string) - Path to CSV file
- `rowIndex` (number) - Row number (1-based, excluding header)
- `options` (object, optional) - Same as `readCSV`

**Returns:** Object (single row)

**Example:**
```javascript
const user1 = await readCSVByRow('testdata/users.csv', 1);
console.log(user1);
// { username: 'john', email: 'john@test.com', password: 'Pass123' }

const user3 = await readCSVByRow('testdata/users.csv', 3);
```

---

#### 3. `readCSVByColumn(filePath, columnName, options)`
Read all values from a specific column.

**Parameters:**
- `filePath` (string) - Path to CSV file
- `columnName` (string) - Column header name
- `options` (object, optional) - Same as `readCSV`

**Returns:** Array of values

**Example:**
```javascript
const emails = await readCSVByColumn('testdata/users.csv', 'email');
console.log(emails);
// ['john@test.com', 'jane@test.com', 'bob@test.com']

const passwords = await readCSVByColumn('testdata/users.csv', 'password');
```

---

#### 4. `findRows(filePath, criteria, options)`
Find rows matching specific criteria.

**Parameters:**
- `filePath` (string) - Path to CSV file
- `criteria` (object) - Column:value pairs to match
- `options` (object, optional) - Same as `readCSV`

**Returns:** Array of matching rows

**Example:**
```javascript
// Find all active users
const activeUsers = await findRows('testdata/users.csv', { status: 'active' });

// Find specific user
const johnDoe = await findRows('testdata/users.csv', { 
    firstName: 'John', 
    lastName: 'Doe' 
});

// Multiple criteria
const premiumActive = await findRows('testdata/users.csv', { 
    plan: 'premium',
    status: 'active'
});
```

---

#### 5. `getHeaders(filePath, options)`
Get column header names.

**Example:**
```javascript
const headers = await getHeaders('testdata/users.csv');
// ['username', 'email', 'password', 'status']
```

---

#### 6. `getRowCount(filePath, options)`
Get total number of rows (excluding header).

**Example:**
```javascript
const count = await getRowCount('testdata/users.csv');
console.log(`Total users: ${count}`);
```

---

#### 7. `getUniqueValues(filePath, columnName, options)`
Get unique values from a column (no duplicates).

**Example:**
```javascript
const countries = await getUniqueValues('testdata/users.csv', 'country');
// ['USA', 'Canada', 'UK']
```

---

## Excel Reader (`excelReader.js`)

### Import

```javascript
const { 
    readExcel, 
    readExcelByRow, 
    readExcelByColumn, 
    getAllSheets,
    findRows,
    getHeaders,
    getRowCount
} = require('../utils/excelReader');
```

### Functions

#### 1. `readExcel(filePath, sheetName)`
Read all data from an Excel sheet.

**Parameters:**
- `filePath` (string) - Path to Excel file
- `sheetName` (string, optional) - Sheet name (defaults to first sheet)

**Returns:** Array of objects (rows)

**Example:**
```javascript
// Read from first sheet
const users = await readExcel('testdata/users.xlsx');

// Read from specific sheet
const admins = await readExcel('testdata/users.xlsx', 'AdminUsers');
console.log(admins);
// [
//   { username: 'admin1', email: 'admin1@test.com', role: 'admin' },
//   { username: 'admin2', email: 'admin2@test.com', role: 'admin' }
// ]
```

---

#### 2. `readExcelByRow(filePath, sheetName, rowIndex)`
Read a specific row from Excel sheet.

**Parameters:**
- `filePath` (string) - Path to Excel file
- `sheetName` (string) - Sheet name
- `rowIndex` (number) - Row number (1-based, excluding header)

**Returns:** Object (single row)

**Example:**
```javascript
const user1 = await readExcelByRow('testdata/users.xlsx', 'Users', 1);
console.log(user1);
// { username: 'john', email: 'john@test.com', password: 'Pass123' }

const user5 = await readExcelByRow('testdata/users.xlsx', 'Users', 5);
```

---

#### 3. `readExcelByColumn(filePath, sheetName, columnName)`
Read all values from a specific column.

**Parameters:**
- `filePath` (string) - Path to Excel file
- `sheetName` (string) - Sheet name
- `columnName` (string) - Column header name

**Returns:** Array of values

**Example:**
```javascript
const emails = await readExcelByColumn('testdata/users.xlsx', 'Users', 'email');
console.log(emails);
// ['john@test.com', 'jane@test.com', 'bob@test.com']
```

---

#### 4. `getAllSheets(filePath)`
Get all sheet names from an Excel file.

**Example:**
```javascript
const sheets = await getAllSheets('testdata/users.xlsx');
console.log(sheets);
// ['Users', 'AdminUsers', 'TestData']
```

---

#### 5. `findRows(filePath, sheetName, criteria)`
Find rows matching specific criteria.

**Parameters:**
- `filePath` (string) - Path to Excel file
- `sheetName` (string) - Sheet name
- `criteria` (object) - Column:value pairs to match

**Returns:** Array of matching rows

**Example:**
```javascript
// Find all active users
const activeUsers = await findRows('testdata/users.xlsx', 'Users', { 
    status: 'active' 
});

// Find premium users
const premiumUsers = await findRows('testdata/users.xlsx', 'Users', { 
    plan: 'premium',
    status: 'active'
});
```

---

#### 6. `getHeaders(filePath, sheetName)`
Get column header names.

**Example:**
```javascript
const headers = await getHeaders('testdata/users.xlsx', 'Users');
// ['username', 'email', 'password', 'status']
```

---

#### 7. `getRowCount(filePath, sheetName)`
Get total number of rows.

**Example:**
```javascript
const count = await getRowCount('testdata/users.xlsx', 'Users');
console.log(`Total users: ${count}`);
```

---

## Usage in Tests

### Example 1: Single User from CSV

```javascript
test('Register user from CSV', async ({ page }) => {
    const userData = await readCSVByRow('testdata/users.csv', 1);
    
    await homePage.navigateToRegisterPage();
    await registerPage.register(
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.password,
        userData.gender
    );
});
```

### Example 2: Loop Through All CSV Data

```javascript
test('Register multiple users', async ({ page }) => {
    const allUsers = await readCSV('testdata/users.csv');
    
    for (const user of allUsers) {
        await homePage.navigateToRegisterPage();
        await registerPage.register(
            user.firstName,
            user.lastName,
            user.email,
            user.password,
            user.gender
        );
        
        await loginPage.login(user.email, user.password);
        console.log(`✓ Registered: ${user.email}`);
    }
});
```

### Example 3: Conditional Data Selection

```javascript
test('Test with active users only', async ({ page }) => {
    const activeUsers = await findRows('testdata/users.csv', { 
        status: 'active' 
    });
    
    const testUser = activeUsers[0]; // Use first active user
    
    await homePage.navigateToRegisterPage();
    await registerPage.register(
        testUser.firstName,
        testUser.lastName,
        testUser.email,
        testUser.password,
        testUser.gender
    );
});
```

### Example 4: Excel with Multiple Sheets

```javascript
test('Use different user types', async ({ page }) => {
    // Regular users
    const regularUser = await readExcelByRow('testdata/users.xlsx', 'Users', 1);
    
    // Admin users
    const adminUser = await readExcelByRow('testdata/users.xlsx', 'AdminUsers', 1);
    
    // Test with regular user
    await loginPage.login(regularUser.email, regularUser.password);
    
    // Test with admin user
    await loginPage.login(adminUser.email, adminUser.password);
});
```

---

## Creating Test Data Files

### CSV File Format (`testdata/users.csv`)

```csv
username,email,password,firstName,lastName,gender,status
john_doe,john.doe@test.com,Password123,John,Doe,male,active
jane_smith,jane.smith@test.com,SecurePass456,Jane,Smith,female,active
bob_wilson,bob.wilson@test.com,TestPass789,Bob,Wilson,male,inactive
```

**Rules:**
- First row must be headers
- No spaces in header names (use camelCase)
- Each row must have same number of columns
- Values with commas should be quoted: `"value, with, commas"`

### Excel File Format

Create an Excel file with:
- **Sheet Name**: `Users` (or any name you want)
- **Headers in Row 1**: username, email, password, firstName, lastName, gender, status
- **Data in Rows 2+**: Your test data

**Tip:** You can have multiple sheets in one Excel file:
- `Users` - Regular test users
- `AdminUsers` - Admin test users
- `InvalidData` - Invalid test cases

---

## Error Handling

All functions include error handling and logging:

```javascript
try {
    const data = await readCSV('testdata/users.csv');
    console.log(data);
} catch (error) {
    console.error('Failed to read CSV:', error.message);
}
```

**Common Errors:**
- File not found - Check file path is correct
- Column not found - Check header name spelling
- Row not found - Check row index is within range
- Sheet not found (Excel) - Check sheet name spelling

---

## Best Practices

1. **Organize Test Data**
   ```
   testdata/
   ├── users.csv          # User accounts
   ├── products.csv       # Product data
   ├── credentials.xlsx   # Login credentials
   └── invalid-data.csv   # Negative test cases
   ```

2. **Use Descriptive Column Names**
   - ✅ `firstName`, `lastName`, `emailAddress`
   - ❌ `col1`, `col2`, `data3`

3. **Separate Valid and Invalid Data**
   - `testdata/valid-users.csv` - For positive tests
   - `testdata/invalid-users.csv` - For negative tests

4. **Cache Data When Possible**
   ```javascript
   // Load once for all tests in describe block
   let allUsers;
   
   test.beforeAll(async () => {
       allUsers = await readCSV('testdata/users.csv');
   });
   
   test('Test 1', async ({ page }) => {
       const user = allUsers[0]; // Use cached data
   });
   ```

5. **Use findRows for Dynamic Selection**
   ```javascript
   // Better than hardcoding row numbers
   const premiumUsers = await findRows('testdata/users.csv', { plan: 'premium' });
   ```

---

## Comparison: CSV vs Excel

| Feature | CSV | Excel |
|---------|-----|-------|
| **File Size** | Smaller | Larger |
| **Speed** | Faster | Slower |
| **Multiple Sheets** | ❌ No | ✅ Yes |
| **Formatting** | Plain text | Rich formatting |
| **Formulas** | ❌ No | ✅ Yes (calculated) |
| **Best For** | Simple data, CI/CD | Complex data, multiple datasets |

**Recommendation:**
- Use **CSV** for simple test data and CI/CD pipelines
- Use **Excel** when you need multiple sheets or complex data structures

---

## Troubleshooting

### Issue: "Module not found: xlsx"
**Solution:** Install the package
```bash
npm install xlsx
```

### Issue: "Module not found: csv-parse"
**Solution:** Install the package
```bash
npm install csv-parse
```

### Issue: "File not found"
**Solution:** Use correct relative path from project root
```javascript
// ❌ Wrong - absolute path
await readCSV('C:/Users/Documents/users.csv');

// ✅ Correct - relative to project root
await readCSV('testdata/users.csv');
```

### Issue: Column "X" not found
**Solution:** Check exact column name in your file (case-sensitive)
```javascript
// Headers in CSV: firstName, lastName, email
const data = await readCSVByColumn('testdata/users.csv', 'firstName'); // ✅
const data = await readCSVByColumn('testdata/users.csv', 'FirstName'); // ❌
```

---

## Advanced Examples

### Data-Driven Testing with Playwright Test

```javascript
// Generate tests dynamically from CSV data
const testData = await readCSV('testdata/login-tests.csv');

testData.forEach((data, index) => {
    test(`Login Test ${index + 1}: ${data.scenario}`, async ({ page }) => {
        await loginPage.login(data.email, data.password);
        
        if (data.expectedResult === 'success') {
            await expect(page).toHaveURL(/.*account/);
        } else {
            await expect(page.locator('.error')).toBeVisible();
        }
    });
});
```

### Combining CSV and Excel

```javascript
test('Use mixed data sources', async ({ page }) => {
    // Get base user from CSV
    const baseUser = await readCSVByRow('testdata/users.csv', 1);
    
    // Get configuration from Excel
    const config = await readExcelByRow('testdata/config.xlsx', 'Settings', 1);
    
    // Use both
    await page.goto(config.baseURL);
    await loginPage.login(baseUser.email, baseUser.password);
});
```

---

*Last Updated: November 14, 2025*
