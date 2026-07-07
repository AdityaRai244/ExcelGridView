
export class GridDimensions {
    public readonly TOTAL_ROWS: number = 100000;
    public readonly TOTAL_COLS: number = 500;
    public readonly ROW_HEADER_WIDTH: number = 50;
    public readonly COL_HEADER_HEIGHT: number = 30;

    public readonly DEFAULT_ROW_HEIGHT: number = 28;
    public readonly DEFAULT_COL_WIDTH: number = 100;

    private rowStore: Map<number, number> = new Map();
    private colStore: Map<number, number> = new Map();

    private cachedTotalGridWidth: number;
    private cachedTotalGridHeight: number;

    constructor() {
        this.cachedTotalGridWidth = this.ROW_HEADER_WIDTH + (this.TOTAL_COLS * this.DEFAULT_COL_WIDTH);
        this.cachedTotalGridHeight = this.COL_HEADER_HEIGHT + (this.TOTAL_ROWS * this.DEFAULT_ROW_HEIGHT);
    }

    // GETS THE WIDTH OF THE COLUMN IN THE GRID
    public getColWidth(col: number): number {
        return this.colStore.get(col) ?? this.DEFAULT_COL_WIDTH;
    }

    // SETS THE WIDTH OF THE COLUMN IN THE GRID
    public setColWidth(col: number, value: number): void {
        const safeWidth = Math.min(Math.max(50, value), 500);
        const oldWidth = this.getColWidth(col);
        this.colStore.set(col, safeWidth);
        this.cachedTotalGridWidth += (safeWidth - oldWidth);
    }

    // GETS THE TOTAL WIDTH OF THE GRID
    public getTotalGridWidth(): number {
        return this.cachedTotalGridWidth;
    }

    // GETS THE X POSITION OF THE COLUMN IN THE GRID
    public getColXPosition(targetCol: number): number {
        let x = this.ROW_HEADER_WIDTH;
        for (let c = 1; c < targetCol; c++) {
            x += this.getColWidth(c);
        }
        return x;
    }

    // GETS THE HEIGHT OF THE ROW IN THE GRID
    public getRowHeight(row: number): number {
        return this.rowStore.get(row) ?? this.DEFAULT_ROW_HEIGHT;
    }

    // SETS THE HEIGHT OF THE ROW IN THE GRID
    public setRowHeight(row: number, value: number): void {
        const safeHeight = Math.min(Math.max(20, value), 150);
        const oldHeight = this.getRowHeight(row);
        this.rowStore.set(row, safeHeight);
        this.cachedTotalGridHeight += (safeHeight - oldHeight);
    }

    // GETS THE TOTAL HEIGHT OF THE GRID
    public getTotalGridHeight(): number {
        return this.cachedTotalGridHeight;
    }

    // GETS THE ROW INDEX AT THE Y POSITION OF THE MOUSE CURSOR USING BINARY SEARCH TO AVOID LOOPING 100,000 ROWS.
    public getRowIndexAtY(targetY: number): number {
        if (targetY <= this.COL_HEADER_HEIGHT) return 1;
        if (targetY >= this.getTotalGridHeight()) return this.TOTAL_ROWS;

        let low = 1;
        let high = this.TOTAL_ROWS;
        let result = 1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const midY = this.getRowYPosition(mid);
            const midHeight = this.getRowHeight(mid);

            if (targetY >= midY && targetY < midY + midHeight) {
                return mid;
            }

            if (targetY < midY) {
                high = mid - 1;
            } else {
                result = mid;
                low = mid + 1;
            }
        }

        return result;
    }

    // GETS THE Y POSITION OF THE ROW IN THE GRID
    public getRowYPosition(targetRow: number): number {
        if (targetRow <= 1) return this.COL_HEADER_HEIGHT;

        let y = this.COL_HEADER_HEIGHT + ((targetRow - 1) * this.DEFAULT_ROW_HEIGHT);

        for (const [row, customHeight] of this.rowStore.entries()) {
            if (row < targetRow) {
                y += (customHeight - this.DEFAULT_ROW_HEIGHT);
            }
        }
        return y;
    }

    // GETS THE EXCEL COLUMN LABLE. EG 1 -> A, 2 -> B, 27 -> AA, 28 -> AB, ETC.
    public getExcelColumnLabel(col: number): string {
        let label = "";
        while (col > 0) {
            let remainder = (col - 1) % 26;
            label = String.fromCharCode(65 + remainder) + label;
            col = Math.floor((col - 1) / 26);
        }
        return label;
    }

}
