// MAEKS CELLS ACTIVE AND TELLS WHICH CELL IS CURRENTLY ACTIVE.

export class SelectionManager {

    public activeRow: number | null = null;
    public activeCol: number | null = null;

    private selectedCells: Set<string> = new Set();

    public select(row: number, col: number): void {
        this.activeRow = row;
        this.activeCol = col;
        this.selectedCells.add(`${row},${col}`);
    }

    public selectMultiple(startRow: number, startCol: number, endRow: number, endCol: number): void {
        this.deselect();
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                this.selectedCells.add(`${row},${col}`);
            }
        }
    }

    public deselect(): void {
        this.activeRow = null;
        this.activeCol = null;
        this.selectedCells.clear();
    }

    public isSelected(row: number, col: number): boolean {
        return this.selectedCells.has(`${row},${col}`);
    }

}