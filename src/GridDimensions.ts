
export class GridDimensions {
    public readonly TOTAL_ROWS: number = 100000;
    public readonly TOTAL_COLS: number = 500;
    public readonly ROW_HEADER_WIDTH: number = 50;
    public readonly COL_HEADER_HEIGHT: number = 30;

    public readonly DEFAULT_ROW_HEIGHT: number = 28;
    public readonly DEFAULT_COL_WIDTH: number = 100;

    public readonly CURSOR_PROMIXITY : number = 5;

    private rowStore: Map<number, number> = new Map();
    private colStore: Map<number, number> = new Map();

    private cachedTotalGridWidth: number;
    private cachedTotalGridHeight: number;

    constructor() {
        this.cachedTotalGridWidth = this.ROW_HEADER_WIDTH + (this.TOTAL_COLS * this.DEFAULT_COL_WIDTH);
        this.cachedTotalGridHeight = this.COL_HEADER_HEIGHT + (this.TOTAL_ROWS * this.DEFAULT_ROW_HEIGHT);
    }

    // returns width of the column
    public getColWidth(col: number): number {
        return this.colStore.get(col) ?? this.DEFAULT_COL_WIDTH;
    }

    // sets the width of the column in the grid
    public setColWidth(col: number, value: number): void {
        const safeWidth = Math.min(Math.max(50, value), 500);
        const oldWidth = this.getColWidth(col);
        this.colStore.set(col, safeWidth);
        this.cachedTotalGridWidth += (safeWidth - oldWidth);
    }

    // returns total width of the grid ( row header + all columns )
    public getTotalGridWidth(): number {
        return this.cachedTotalGridWidth;
    }

    // returns x position of the column in the grid
    public getColXPosition(targetCol: number): number {
        let x = this.ROW_HEADER_WIDTH;
        for (let c = 1; c < targetCol; c++) {
            x += this.getColWidth(c);
        }
        return x;
    }

    // returns height of the row in the grid
    public getRowHeight(row: number): number {
        return this.rowStore.get(row) ?? this.DEFAULT_ROW_HEIGHT;
    }

    // sets the height of the row in the grid
    public setRowHeight(row: number, value: number): void {
        const safeHeight = Math.min(Math.max(20, value), 150);
        const oldHeight = this.getRowHeight(row);
        this.rowStore.set(row, safeHeight);
        this.cachedTotalGridHeight += (safeHeight - oldHeight);
    }

    // returns total height of the grid ( col header + all rows )
    public getTotalGridHeight(): number {
        return this.cachedTotalGridHeight;
    }

    // returns the row index at the y position of the mouse cursor using binary search to avoid looping 100,000 rows.
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

    // returns the column index at the x position of the mouse cursor using binary search.
    // simple for loop is fine as well since the no. of cols is only 500.
    public getColIndexAtX(targetX: number): number {
        if (targetX <= this.ROW_HEADER_WIDTH) return 1;
        if (targetX >= this.getTotalGridWidth()) return this.TOTAL_COLS;

        let low = 1;
        let high = this.TOTAL_COLS;
        let result = 1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const midX = this.getColXPosition(mid);
            const midWidth = this.getColWidth(mid);

            if (targetX >= midX && targetX < midX + midWidth) {
                return mid;
            }

            if (targetX < midX) {
                high = mid - 1;
            } else {
                result = mid;
                low = mid + 1;
            }
        }

        return result;
    }

    // returns y position of the row in the grid
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

    // returns excel column lable. eg 1 -> A, 2 -> B, 27 -> AA, 28 -> AB, etc.
    public getExcelColumnLabel(col: number): string {
        let label = "";
        while (col > 0) {
            let remainder = (col - 1) % 26;
            label = String.fromCharCode(65 + remainder) + label;
            col = Math.floor((col - 1) / 26);
        }
        return label;
    }

    public getExcelColumnNumber(label: string): number {
        let col = 0;

        const cleanLabel = label.toUpperCase();
        for (let i = 0; i < cleanLabel.length; i++) {
            const charValue = cleanLabel.charCodeAt(i) - 65 + 1;
            col = col * 26 + charValue;
        }

        return col;
    }


}
