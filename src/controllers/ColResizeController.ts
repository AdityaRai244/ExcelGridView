import type { ExcelGrid } from "../ExcelGrid.js";

export class ColResizeController {

    public isColResizing = false;
    public resizeTargetCol: number | null = null;
    public colResizeStartMouseX = 0;
    public colResizeStartWidth = 0;

    constructor(
        private grid: ExcelGrid,
    ) { }

    public handleColResize(e: MouseEvent, mouseX: number,mouseY : number) {
        // If the mouse is above col header (less then col height) and right of the row headers
        //  that means we are clicking and dragging on the column headers.
        if (mouseY - this.grid.scrollPane.scrollTop < this.grid.dimensions.COL_HEADER_HEIGHT && mouseX - this.grid.scrollPane.scrollLeft > this.grid.dimensions.ROW_HEADER_WIDTH) {
            const colCandidate = this.grid.dimensions.getColIndexAtX(mouseX);
            const colX = this.grid.dimensions.getColXPosition(colCandidate);
            const colWidth = this.grid.dimensions.getColWidth(colCandidate);
            // if the cursor is around 5px of the right side of the col that means we are expanding the col.
            if (Math.abs(mouseX - (colX + colWidth)) <= this.grid.dimensions.CURSOR_PROMIXITY) {
                this.isColResizing = true;
                this.resizeTargetCol = colCandidate;
                this.colResizeStartMouseX = e.clientX;
                this.colResizeStartWidth = colWidth;

                this.grid.inputController.commitInputChanges();
                e.preventDefault();
                return;
            }
            else if (colCandidate > 1 && Math.abs(mouseX - colX) <= this.grid.dimensions.CURSOR_PROMIXITY) {
                // If the cursor is 5px from the left of the current column 
                // that means we are expanding the previous column. 
                // (because the left border of the current column is the right border of the previous column)
                this.isColResizing = true;
                this.resizeTargetCol = colCandidate - 1;
                this.colResizeStartMouseX = e.clientX;
                this.colResizeStartWidth = this.grid.dimensions.getColWidth(colCandidate - 1);

                this.grid.inputController.commitInputChanges();
                e.preventDefault();
                return;
            }


        }

    }

}