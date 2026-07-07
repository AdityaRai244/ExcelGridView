import { Cell } from "./Cell.js";

export class DataStore {

    private dataStore: Map<string, Cell> = new Map();

    public getCellData(row: number, col: number): string {
        const key = `${row},${col}`;
        return this.dataStore.get(key)?.value ?? '';
    }

    public setCellData(row: number, col: number, newValue: string | undefined): void {
        const key = `${row},${col}`;
        if (!newValue) {
            this.dataStore.delete(key);
        } else {
            this.dataStore.set(key, new Cell(newValue));
        }
    }

    public clear(): void {
        this.dataStore.clear();
    }

}