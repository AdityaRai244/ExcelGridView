export function seedSpreadsheetData(gridDimensions: any) {
    const firstNames = ["Raj", "Amit", "Priya", "Neha", "Vijay", "Anjali", "Suresh", "Rohan", "Deepak", "Kiran"];
    const lastNames = ["Solanki", "Sharma", "Verma", "Patel", "Mehra", "Joshi", "Gupta", "Rao", "Singh", "Das"];

    console.time("Data Generation Time");

    const dataStore = gridDimensions["dataStore"] || gridDimensions.dataStore;
    dataStore.clear();

    const totalRecords = 50000;

    for (let i = 1; i <= totalRecords; i++) {
        const record = {
            id: i,
            firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
            lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
            age: Math.floor(Math.random() * 45) + 20, 
            salary: Math.floor(Math.random() * 1500000) + 300000 
        };

        const targetRow = i;

        gridDimensions.setCellData(targetRow, 1, record.id.toString());
        gridDimensions.setCellData(targetRow, 2, record.firstName);
        gridDimensions.setCellData(targetRow, 3, record.lastName);
        gridDimensions.setCellData(targetRow, 4, record.age.toString());
        gridDimensions.setCellData(targetRow, 5, record.salary.toString());
    }

    console.timeEnd("Data Generation Time");
}