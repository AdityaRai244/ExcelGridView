export class CellRange {
    constructor(
        public startRow: number,
        public startCol: number,
        public endRow: number,
        public endCol: number
    ) { }

    public get minRow(): number {
        return Math.min(this.startRow, this.endRow);
    }

    public get maxRow(): number {
        return Math.max(this.startRow, this.endRow);
    }

    public get minCol(): number {
        return Math.min(this.startCol, this.endCol);
    }

    public get maxCol(): number {
        return Math.max(this.startCol, this.endCol);
    }

    public contains(row: number, col: number): boolean {
        return row >= this.minRow && row <= this.maxRow && col >= this.minCol && col <= this.maxCol;
    }

}