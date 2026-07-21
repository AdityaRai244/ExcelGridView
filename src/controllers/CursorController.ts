import type { ExcelGrid } from "../ExcelGrid.js";

export class CursorController {

    constructor(private grid: ExcelGrid) { }


    public setCursor(e: MouseEvent, mouseX: number, mouseY: number) {
        // Update cursor styles based on hover bounds
        let cursorStyle = 'default';
        if (mouseY <= this.grid.dimensions.COL_HEADER_HEIGHT && mouseX >= this.grid.dimensions.ROW_HEADER_WIDTH) {
            const colCandidate = this.grid.dimensions.getColIndexAtX(mouseX);
            const colX = this.grid.dimensions.getColXPosition(colCandidate);
            const colWidth = this.grid.dimensions.getColWidth(colCandidate);

            if (Math.abs(mouseX - (colX + colWidth)) <= this.grid.dimensions.CURSOR_PROMIXITY || (colCandidate > 1 && Math.abs(mouseX - colX) <= this.grid.dimensions.CURSOR_PROMIXITY)) {
                cursorStyle = 'col-resize';
            }
        } else if (mouseY > this.grid.dimensions.COL_HEADER_HEIGHT && mouseX < this.grid.dimensions.ROW_HEADER_WIDTH) {
            const rowCandidate = this.grid.dimensions.getRowIndexAtY(mouseY);
            const rowY = this.grid.dimensions.getRowYPosition(rowCandidate);
            const rowHeight = this.grid.dimensions.getRowHeight(rowCandidate);
            const rowBottomY = rowY + rowHeight;
            if (Math.abs(mouseY - rowBottomY) <= this.grid.dimensions.CURSOR_PROMIXITY || (rowCandidate > 1 && Math.abs(mouseY - rowY) <= this.grid.dimensions.CURSOR_PROMIXITY)) {
                cursorStyle = 'row-resize';
            }
        }


        this.grid.scrollPane.style.cursor = cursorStyle;
    }

    public getCursorPosition(e: MouseEvent) {
        const rect = this.grid.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.grid.scrollPane.scrollLeft;
        const mouseY = e.clientY - rect.top + this.grid.scrollPane.scrollTop;

        return {mouseX, mouseY}
    }
}