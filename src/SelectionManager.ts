import { CellRange } from "./CellRange.js";

export class SelectionManager {

    public activeRow: number | null = null;
    public activeCol: number | null = null;
    public selectedRanges: CellRange[] = [];

    public select(row: number, col: number): void {
        this.activeRow = row;
        this.activeCol = col;
        this.selectedRanges = [new CellRange(row, col, row, col)];
    }

    public selectMultiple(startRow: number, startCol: number, endRow: number, endCol: number): void {
        this.deselect();
        this.selectedRanges = [new CellRange(startRow, startCol, endRow, endCol)];
    }

    public selectCol(col: number, totalRows: number): void {
        this.activeRow = 1;
        this.activeCol = col;
        this.selectedRanges = [new CellRange(1, col, totalRows, col)];
    }

    public selectRow(row: number, totalCols: number): void {
        this.activeRow = row;
        this.activeCol = 1;
        this.selectedRanges = [new CellRange(row, 1, row, totalCols)];
    }

    public deselect(): void {
        this.activeRow = null;
        this.activeCol = null;
        this.selectedRanges = [];
    }

    public isSelected(row: number, col: number): boolean {
        for (const range of this.selectedRanges) {
            if (range.contains(row, col)) {
                return true;
            }
        }
        return false;
    }

}