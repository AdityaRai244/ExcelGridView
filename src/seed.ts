import { DataStore } from "./DataStore.js";
import type { ExcelGrid } from "./ExcelGrid.js";

const firstNames = ["Raj", "Amit", "Priya", "Neha", "Vijay", "Anjali", "Suresh", "Rohan", "Deepak", "Kiran"];
const lastNames = ["Solanki", "Sharma", "Verma", "Patel", "Mehra", "Joshi", "Gupta", "Rao", "Singh", "Das"];

const JSON_FILE_URL = "./src/data.json";

export async function seedSpreadsheetData(dataStore: DataStore, grid : ExcelGrid) {
    dataStore.clear();

    try {
        console.time("JSON Fetch Time");
        const response = await fetch(JSON_FILE_URL);
        const records = await response.json();

        if (!records || records.length === 0) {
            console.log("JSON file is empty. Generating 50,000 records...");
            console.time("Generation Time");
            
            const generatedRecords = [];
            const totalRecords = 50000;

            for (let i = 1; i <= totalRecords; i++) {
                const record = {
                    id: i,
                    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
                    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
                    age: Math.floor(Math.random() * 45) + 20,
                    salary: Math.floor(Math.random() * 1500000) + 300000
                };
                generatedRecords.push(record);
                populateRow(dataStore, i, record);
            }
            console.timeEnd("Generation Time");

            console.log(JSON.stringify(generatedRecords));
            return;
        }

        for (let i = 0; i < records.length; i++) {
            populateRow(dataStore, i + 1, records[i]);
        }
        grid.drawGrid();

    } catch (error) {
        console.error("Error loading JSON file. Make sure you are running a local server!", error);
    }
}

function populateRow(dataStore: DataStore, row: number, record: any) {
    dataStore.setCellData(row, 1, record.id.toString());
    dataStore.setCellData(row, 2, record.firstName);
    dataStore.setCellData(row, 3, record.lastName);
    dataStore.setCellData(row, 4, record.age.toString());
    dataStore.setCellData(row, 5, record.salary.toString());
}
