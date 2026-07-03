import { Cell } from "./Cell.js";

export class GridDimensions {
    // Sizing Configurations
    public readonly TOTAL_ROWS: number = 100000;
    public readonly TOTAL_COLS: number = 500;
    public readonly ROW_HEIGHT: number = 28;
    public readonly ROW_HEADER_WIDTH: number = 50;
    public readonly COL_HEADER_HEIGHT: number = 30;

    public readonly DEFAULT_COL_WIDTH: number = 100;


    private colStore: Map<number, number> = new Map();
    private dataStore: Map<string, Cell> = new Map();

    public getColWidth(col: number): number {
        return this.colStore.get(col) ?? this.DEFAULT_COL_WIDTH;
    }

    public setColWidth(col: number, value: number): void {
        const safeWidth = Math.max(50, value);
        const superSafeWidth = Math.min(safeWidth,500);
        this.colStore.set(col, superSafeWidth);
    }

    public getTotalGridWidth(): number {
        let total = this.ROW_HEADER_WIDTH;
        for (let c = 1; c <= this.TOTAL_COLS; c++) {
            total += this.getColWidth(c);
        }
        return total;
    }

     public getColXPosition(targetCol: number): number {
        let x = this.ROW_HEADER_WIDTH;
        for (let c = 1; c < targetCol; c++) {
            x += this.getColWidth(c);
        }
        return x;
    }

    // Converts column numbers to standard Excel lettering labels (1 -> A, 27 -> AA)
    public getExcelColumnLabel(col: number): string {
        let label = "";
        while (col > 0) {
            let remainder = (col - 1) % 26;
            label = String.fromCharCode(65 + remainder) + label;
            col = Math.floor((col - 1) / 26);
        }
        return label;
    }

    // Generates coordinates key to retrieve text or structural objects
    public getCellData(row: number, col: number): string {
        if (row === 0) return this.getExcelColumnLabel(col);
        const key = `${row},${col}`;
        return this.dataStore.get(key)?.value ?? '';
    }

    // Writes data back into a cell instance. 
    // OPTIMIZATION: If the cell is emptied, we delete the key to save space in RAM!
    public setCellData(row: number, col: number, newValue: string): void {
        const key = `${row},${col}`;
        if (newValue === "") {
            this.dataStore.delete(key);
        } else {
            this.dataStore.set(key, new Cell(newValue));
        }
    }
}
