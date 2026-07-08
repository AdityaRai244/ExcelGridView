import type { ExcelGrid } from "./ExcelGrid.js";

export class RowResizeController {

    public isRowResizing = false;
    public resizeTargetRow: number | null = null;
    public rowResizeStartMouseY = 0;
    public rowResizeStartHeight = 0;

    constructor(
        private grid: ExcelGrid,
    ) { }

    public handleRowResize(e: MouseEvent, mouseY: any) {

        // which row is our mouse cursor on ? Total number of rows are 100,000 so that means we cannot use a simple loop. 
        // Using binary search we find which row is our candidate.
        const rowCandidate = this.grid.dimensions.getRowIndexAtY(mouseY);
        const rowY = this.grid.dimensions.getRowYPosition(rowCandidate);
        const rowHeight = this.grid.dimensions.getRowHeight(rowCandidate);
        const rowBottomY = rowY + rowHeight;
        // if the cursor is around 5px of the bottom of the row that means we are expanding the row.
        if (Math.abs(mouseY - rowBottomY) <= 5) {
            this.isRowResizing = true;
            this.resizeTargetRow = rowCandidate;
            this.rowResizeStartMouseY = e.clientY;
            this.rowResizeStartHeight = this.grid.dimensions.getRowHeight(rowCandidate);

            this.grid.interaction.commitInputChanges();
            e.preventDefault();
            return;
        }
        // Resize row if close to top border of candidate (previous row's bottom border)
        else if (rowCandidate > 1 && Math.abs(mouseY - rowY) <= 5) {
            this.isRowResizing = true;
            this.resizeTargetRow = rowCandidate - 1;
            this.rowResizeStartMouseY = e.clientY;
            this.rowResizeStartHeight = this.grid.dimensions.getRowHeight(rowCandidate - 1);
            this.grid.interaction.commitInputChanges();
            e.preventDefault();
            return;
        }

    }

}