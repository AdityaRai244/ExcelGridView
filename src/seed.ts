/**
 * Generates mock data and loads it into the spreadsheet grid dimensions store.
 * @param {GridDimensions} gridDimensions - The instance of your GridDimensions class.
 */
export function seedSpreadsheetData(gridDimensions: any) {
    // 1. Array of names to randomly pick from to keep data varied
    const firstNames = ["Raj", "Amit", "Priya", "Neha", "Vijay", "Anjali", "Suresh", "Rohan", "Deepak", "Kiran"];
    const lastNames = ["Solanki", "Sharma", "Verma", "Patel", "Mehra", "Joshi", "Gupta", "Rao", "Singh", "Das"];

    console.time("Data Generation Time");

    // 2. Clear out any previous data to free up RAM memory allocations
    // Accessing the private map via bracket notation if TypeScript blocks direct reference
    const dataStore = gridDimensions["dataStore"] || gridDimensions.dataStore;
    dataStore.clear();

    // 3. Define our object structural columns matching our schema index
    // Col 1 = ID, Col 2 = First Name, Col 3 = Last Name, Col 4 = Age, Col 5 = Salary
    const totalRecords = 50000;

    for (let i = 1; i <= totalRecords; i++) {
        // Generate random mock values matching your required schema format
        const record = {
            id: i,
            firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
            lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
            age: Math.floor(Math.random() * 45) + 20, // Ages between 20 and 64
            salary: Math.floor(Math.random() * 1500000) + 300000 // Salaries between 300k and 1.8M
        };

        // 4. Map object properties to absolute cell grid coordinates
        // Row 1 is reserved for your excel Column Headers (A, B, C), so data rows start at row index + 1
        const targetRow = i;

        gridDimensions.setCellData(targetRow, 1, record.id.toString());
        gridDimensions.setCellData(targetRow, 2, record.firstName);
        gridDimensions.setCellData(targetRow, 3, record.lastName);
        gridDimensions.setCellData(targetRow, 4, record.age.toString());
        gridDimensions.setCellData(targetRow, 5, record.salary.toString());
    }

    console.timeEnd("Data Generation Time");
}