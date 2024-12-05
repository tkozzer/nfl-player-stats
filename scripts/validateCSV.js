import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Expected headers for each position
const EXPECTED_HEADERS = {
    qbs: [
        'Rank', 'Player', 'G', 'COMP', 'ATT', 'PCT', 'YDS', 'Y/A', 'AIR', 'AIR/A',
        '10+ YDS', '20+ YDS', '30+ YDS', '40+ YDS', '50+ YDS',
        'PKT TIME', 'SACK', 'KNCK', 'HRRY', 'BLITZ', 'POOR', 'DROP', 'RZ ATT', 'RTG'
    ],
    rbs: [
        'Rank', 'Player', 'G', 'ATT', 'YDS', 'Y/ATT', 'YBCON', 'YBCON/ATT', 'YACON', 'YACON/ATT',
        'BRKTKL', 'TK LOSS', 'TK LOSS YDS', 'LNG TD', '10+ YDS', '20+ YDS', '30+ YDS', '40+ YDS', '50+ YDS',
        'LNG', 'REC', 'TGT', 'RZ TGT', 'YACON'
    ],
    wrs: [
        'Rank', 'Player', 'G', 'REC', 'YDS', 'Y/R', 'YBC', 'YBC/R', 'AIR', 'AIR/R',
        'YAC', 'YAC/R', 'YACON', 'YACON/R', 'BRKTKL', 'TGT', '% TM', 'CATCHABLE',
        'DROP', 'RZ TGT', '10+ YDS', '20+ YDS', '30+ YDS', '40+ YDS', '50+ YDS', 'LNG'
    ],
    tes: [
        'Rank', 'Player', 'G', 'REC', 'YDS', 'Y/R', 'YBC', 'YBC/R', 'AIR', 'AIR/R',
        'YAC', 'YAC/R', 'YACON', 'YACON/R', 'BRKTKL', 'TGT', '% TM', 'CATCHABLE',
        'DROP', 'RZ TGT', '10+ YDS', '20+ YDS', '30+ YDS', '40+ YDS', '50+ YDS', 'LNG'
    ]
};

// Validation functions
function validateHeaders(headers, position) {
    const expectedHeaders = EXPECTED_HEADERS[position];
    if (!expectedHeaders) {
        return {
            isValid: false,
            errors: [`Unknown position: ${position}`]
        };
    }

    const errors = [];
    const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
    const extraHeaders = headers.filter(header => !expectedHeaders.includes(header));

    if (missingHeaders.length > 0) {
        errors.push(`Missing headers: ${missingHeaders.join(', ')}`);
    }
    if (extraHeaders.length > 0) {
        errors.push(`Extra headers: ${extraHeaders.join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateDataTypes(rows, headers) {
    const errors = [];

    rows.forEach((row, index) => {
        // Check if row has correct number of columns
        if (row.length !== headers.length) {
            errors.push(`Row ${index + 1}: Expected ${headers.length} columns but got ${row.length}`);
            return;
        }

        // Validate Rank is a number
        if (isNaN(row[0])) {
            errors.push(`Row ${index + 1}: Rank should be a number`);
        }

        // Validate Player name format (should contain parentheses with team)
        if (!row[1].includes('(') || !row[1].includes(')')) {
            errors.push(`Row ${index + 1}: Player name should include team in parentheses`);
        }

        // Validate numeric fields
        row.forEach((value, colIndex) => {
            if (colIndex > 1) { // Skip Rank and Player columns
                if (value !== '' && isNaN(value.replace('%', ''))) {
                    errors.push(`Row ${index + 1}, Column ${headers[colIndex]}: Expected number but got "${value}"`);
                }
            }
        });
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateCSVFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.trim().split('\n');
        const headers = lines[0].split(',');

        // Determine position from directory name
        const position = basename(dirname(filePath));

        // Validate headers
        const headerValidation = validateHeaders(headers, position);
        if (!headerValidation.isValid) {
            return headerValidation;
        }

        // Parse and validate data rows
        const rows = lines.slice(1).map(line => line.split(','));
        const dataValidation = validateDataTypes(rows, headers);

        return {
            isValid: dataValidation.isValid,
            errors: dataValidation.errors
        };
    } catch (error) {
        return {
            isValid: false,
            errors: [`Error reading file: ${error.message}`]
        };
    }
}

function validateDirectory(dirPath) {
    try {
        const entries = readdirSync(dirPath, { withFileTypes: true });
        let allValid = true;
        const validationResults = {};

        for (const entry of entries) {
            const fullPath = join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // Recursively validate subdirectories
                const subDirResults = validateDirectory(fullPath);
                allValid = allValid && subDirResults.allValid;
                Object.assign(validationResults, subDirResults.results);
            } else if (entry.isFile() && entry.name.endsWith('.csv')) {
                // Validate CSV files
                const result = validateCSVFile(fullPath);
                validationResults[fullPath] = result;
                allValid = allValid && result.isValid;
            }
        }

        return {
            allValid,
            results: validationResults
        };
    } catch (error) {
        return {
            allValid: false,
            results: {
                [dirPath]: {
                    isValid: false,
                    errors: [`Error processing directory: ${error.message}`]
                }
            }
        };
    }
}

// Main execution
const dataDir = join(__dirname, '../resources/data');
if (existsSync(dataDir)) {
    console.log('Validating CSV files...');
    const validation = validateDirectory(dataDir);

    if (validation.allValid) {
        console.log('✅ All CSV files are valid!');
    } else {
        console.log('❌ Validation errors found:');
        Object.entries(validation.results).forEach(([file, result]) => {
            if (!result.isValid) {
                console.log(`\nFile: ${file}`);
                result.errors.forEach(error => console.log(`  - ${error}`));
            }
        });
        process.exit(1); // Exit with error code
    }
} else {
    console.error('Data directory not found:', dataDir);
    process.exit(1);
} 