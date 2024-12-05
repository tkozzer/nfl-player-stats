import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to split player name and team
function splitPlayerInfo(playerValue) {
    const match = playerValue.match(/(.*?)\s*\((\w+)\)/);
    if (match) {
        return {
            Name: match[1].trim(),
            Team: match[2]
        };
    }
    return {
        Name: playerValue,
        Team: 'FA' // Default to Free Agent if no team is specified
    };
}

// Function to convert CSV content to JSON
function convertToJSON(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');
    const rankIndex = headers.indexOf('Rank');
    const playerIndex = headers.indexOf('Player');

    // Track YACON field occurrences for running backs
    let yaconCount = 0;

    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        yaconCount = 0; // Reset for each line

        headers.forEach((header, index) => {
            // Skip the Rank field
            if (index !== rankIndex && index < values.length) {
                const value = values[index];
                let finalHeader = header.trim();

                // Handle Player field specially
                if (index === playerIndex) {
                    const playerInfo = splitPlayerInfo(value);
                    Object.assign(obj, playerInfo);
                } else if (value !== '') {
                    // Handle YACON fields for running backs
                    if (finalHeader === 'YACON') {
                        yaconCount++;
                        if (yaconCount === 1) {
                            finalHeader = 'YACON (Rushing)';
                        } else if (yaconCount === 2) {
                            finalHeader = 'YACON (Receiving)';
                        }
                    }

                    // Convert to number if it's numeric and not empty
                    const numValue = value.replace(/,/g, ''); // Remove commas from numbers
                    obj[finalHeader] = !isNaN(numValue) && numValue !== '' ? Number(numValue) : value;
                }
            }
        });
        return obj;
    });
}

// Function to process a single file
function processFile(inputPath) {
    try {
        // Read the input file
        const content = readFileSync(inputPath, 'utf-8');

        // Convert the content
        const jsonContent = convertToJSON(content);

        // Determine the output directory and filename
        const positionDir = basename(dirname(inputPath)); // e.g., 'qbs', 'rbs'
        const outputDir = join(__dirname, '../src/data', positionDir);
        const outputFileName = basename(inputPath).replace('.csv', '.json');
        const outputPath = join(outputDir, outputFileName);

        // Create output directory if it doesn't exist
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        // Write the JSON file
        writeFileSync(outputPath, JSON.stringify(jsonContent, null, 2));
        console.log(`Converted ${inputPath} to ${outputPath}`);
    } catch (error) {
        console.error(`Error processing file ${inputPath}:`, error);
    }
}

// Function to process all .csv files in a directory
function processDirectory(dirPath) {
    try {
        const entries = readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // Recursively process subdirectories
                processDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.csv')) {
                // Process .csv files
                processFile(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${dirPath}:`, error);
    }
}

// Start processing from the data directory
const dataDir = join(__dirname, '../resources/data');
if (existsSync(dataDir)) {
    processDirectory(dataDir);
    console.log('All conversions complete!');
} else {
    console.error('Data directory not found:', dataDir);
} 