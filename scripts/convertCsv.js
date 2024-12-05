import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Position-specific compound headers
const POSITION_HEADERS = {
    qbs: {
        compounds: [
            ...(Array.from({ length: 5 }, (_, i) => `${(i + 1) * 10}+ YDS`)),
            'PKT TIME',
            'RZ ATT'
        ]
    },
    rbs: {
        compounds: [
            ...(Array.from({ length: 5 }, (_, i) => `${(i + 1) * 10}+ YDS`)),
            'TK LOSS',
            'TK LOSS YDS',
            'LNG TD',
            'RZ TGT'
        ]
    },
    wrs: {
        compounds: [
            ...(Array.from({ length: 5 }, (_, i) => `${(i + 1) * 10}+ YDS`)),
            '% TM',
            'RZ TGT'
        ]
    },
    tes: {
        compounds: [
            ...(Array.from({ length: 5 }, (_, i) => `${(i + 1) * 10}+ YDS`)),
            '% TM',
            'RZ TGT'
        ]
    }
};

// Function to process header line
function processHeader(line, position) {
    // Get position-specific compound headers
    const positionConfig = POSITION_HEADERS[position] || {};
    const specialCases = positionConfig.compounds || [];
    let processedLine = line;

    // Temporarily replace spaces in special cases with a placeholder
    specialCases.forEach(match => {
        if (match === '% TM') {
            // Special handling for % TM since it starts with a special character
            processedLine = processedLine.replace(/(%\s+TM)/g, match.replace(' ', '_SPACE_'));
        } else if (match === 'TK LOSS YDS') {
            // Special handling for TK LOSS YDS
            processedLine = processedLine.replace(/TK\s+LOSS\s+YDS/g, match.replace(/\s+/g, '_SPACE_'));
        } else if (match === 'TK LOSS') {
            // Special handling for TK LOSS
            processedLine = processedLine.replace(/TK\s+LOSS(?!\s+YDS)/g, match.replace(' ', '_SPACE_'));
        } else if (match === 'LNG TD') {
            // Special handling for LNG TD
            processedLine = processedLine.replace(/LNG\s+TD/g, match.replace(' ', '_SPACE_'));
        } else {
            processedLine = processedLine.replace(match, match.replace(' ', '_SPACE_'));
        }
    });

    // Split by tabs or multiple spaces
    const headers = processedLine.split(/[\t\s]+/).filter(Boolean);

    // Restore spaces in special cases
    return headers.map(header => header.replace(/_SPACE_/g, ' ')).join(',');
}

// Function to convert space/tab separated content to CSV
function convertToCSV(content, position) {
    const lines = content.trim().split('\n');
    return lines.map((line, index) => {
        if (index === 0) {
            // Handle header line
            return processHeader(line, position);
        }

        // Handle data lines
        const nameMatch = line.match(/^(\d+)\s+(.*?\))\s+(.*)$/);
        if (!nameMatch) return line; // Return original line if pattern doesn't match

        const [, rank, playerName, restOfLine] = nameMatch;

        // Split the rest of the line by spaces/tabs and filter empty strings
        const restValues = restOfLine.split(/[\s\t]+/).filter(Boolean)
            // Remove any commas from numbers
            .map(val => val.replace(/,/g, ''));

        // Combine all parts
        return [rank, playerName, ...restValues].join(',');
    }).join('\n');
}

// Function to process a single file
function processFile(inputPath) {
    try {
        // Read the input file
        const content = readFileSync(inputPath, 'utf-8');

        // Determine the position from the directory name
        const position = basename(dirname(inputPath)); // e.g., 'qbs', 'rbs'

        // Convert the content with position-specific handling
        const csvContent = convertToCSV(content, position);

        // Determine the output directory and filename
        const outputDir = join(__dirname, '../resources/data', position);
        const outputFileName = basename(inputPath).replace('.txt', '.csv');
        const outputPath = join(outputDir, outputFileName);

        // Create output directory if it doesn't exist
        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        // Write the CSV file
        writeFileSync(outputPath, csvContent);
        console.log(`Converted ${inputPath} to ${outputPath}`);
    } catch (error) {
        console.error(`Error processing file ${inputPath}:`, error);
    }
}

// Function to process all .txt files in a directory
function processDirectory(dirPath) {
    try {
        const entries = readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // Recursively process subdirectories
                processDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.txt')) {
                // Process .txt files
                processFile(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${dirPath}:`, error);
    }
}

// Start processing from the raw_data directory
const rawDataDir = join(__dirname, '../resources/raw_data');
if (existsSync(rawDataDir)) {
    processDirectory(rawDataDir);
    console.log('All conversions complete!');
} else {
    console.error('Raw data directory not found:', rawDataDir);
} 