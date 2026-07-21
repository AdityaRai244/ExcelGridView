import { ResizeRowCommand } from "../command/ResizeRowCommand.js";
import type { ExcelGrid } from "../ExcelGrid.js";

export class RowResizeController {

    public isRowResizing = false;
    public resizeTargetRow: number | null = null;
    public rowResizeStartMouseY = 0;
    public rowResizeStartHeight = 0;

    constructor(
        private grid: ExcelGrid,
    ) { }

    public handleRowResize(e: MouseEvent, mouseX: number, mouseY: number) {

        // which row is our mouse cursor on ? Total number of rows are 100,000 so that means we cannot use a simple loop. 
        // Using binary search we find which row is our candidate.

        if (mouseX - this.grid.scrollPane.scrollLeft < this.grid.dimensions.ROW_HEADER_WIDTH && mouseY - this.grid.scrollPane.scrollTop > this.grid.dimensions.COL_HEADER_HEIGHT) {


            const rowCandidate = this.grid.dimensions.getRowIndexAtY(mouseY);
            const rowY = this.grid.dimensions.getRowYPosition(rowCandidate);
            const rowHeight = this.grid.dimensions.getRowHeight(rowCandidate);
            const rowBottomY = rowY + rowHeight;
            // if the cursor is around 5px of the bottom of the row that means we are expanding the row.
            if (Math.abs(mouseY - rowBottomY) <= this.grid.dimensions.CURSOR_PROMIXITY) {
                this.isRowResizing = true;
                this.resizeTargetRow = rowCandidate;
                this.rowResizeStartMouseY = e.clientY;
                this.rowResizeStartHeight = this.grid.dimensions.getRowHeight(rowCandidate);

                this.grid.inputController.commitInputChanges();
                e.preventDefault();
                return;
            }
            // Resize row if close to top border of candidate (previous row's bottom border)
            else if (rowCandidate > 1 && Math.abs(mouseY - rowY) <= this.grid.dimensions.CURSOR_PROMIXITY) {
                this.isRowResizing = true;
                this.resizeTargetRow = rowCandidate - 1;
                this.rowResizeStartMouseY = e.clientY;
                this.rowResizeStartHeight = this.grid.dimensions.getRowHeight(rowCandidate - 1);
                this.grid.inputController.commitInputChanges();
                e.preventDefault();
                return;
            }

        }
    }

    public handleRowResizeMove(e: MouseEvent) {
        // if we are resizing the row
        if (this.grid.rowResizeController.isRowResizing && this.grid.rowResizeController.resizeTargetRow !== null) {
            // how much has the row moved ? current position - old position.
            //  Set that as the new height for the row in real time.
            const deltaY = e.clientY - this.grid.rowResizeController.rowResizeStartMouseY;
            const newHeight = this.grid.rowResizeController.rowResizeStartHeight + deltaY;

            this.grid.dimensions.setRowHeight(this.grid.rowResizeController.resizeTargetRow, newHeight);
            this.grid.scrollContent.style.height = `${this.grid.dimensions.getTotalGridHeight()}px`;
            requestAnimationFrame(() => this.grid.drawGrid());
            return;
        }
    }

    public handleRowResizeUp() {
        if (this.isRowResizing && this.resizeTargetRow !== null) {
            const row = this.resizeTargetRow;
            const finalHeight = this.grid.dimensions.getRowHeight(row);

            if (finalHeight !== this.grid.mouseEventsController.rowOriginalHeightBeforeDrag) {
                const command = new ResizeRowCommand(
                    this.grid,
                    row,
                    this.grid.mouseEventsController.rowOriginalHeightBeforeDrag,
                    finalHeight
                );

                this.grid.commandController.executeCommand(command);
            }
        }
    }

}