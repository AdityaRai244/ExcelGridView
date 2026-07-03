export class SelectionManager {

    public activeRow: number | null = null;
    public activeCol: number | null = null;

    public select(row: number, col: number): void {
        this.activeRow = row;
        this.activeCol = col;
    }

    public isSelected(row: number, col: number): boolean {
        return this.activeRow === row && this.activeCol === col; 
    }


}