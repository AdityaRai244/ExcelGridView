import type { ExcelGrid } from "../ExcelGrid.js";

export class SelectionController {

    constructor(
        private grid: ExcelGrid,
    ) { }

    public selectRow(mouseX: number, mouseY: number) {

        const rowCandidate = this.grid.dimensions.getRowIndexAtY(mouseY);
        if (mouseX - this.grid.scrollPane.scrollLeft < this.grid.dimensions.ROW_HEADER_WIDTH) {
            this.grid.selection.selectRow(rowCandidate, this.grid.dimensions.TOTAL_COLS);
            this.grid.inputController.commitInputChanges();
            this.grid.drawGrid();
            return;
        }
    }

    public selectCol(mouseX: number, mouseY: number) {
        const colCandidate = this.grid.dimensions.getColIndexAtX(mouseX);

        if (mouseY - this.grid.scrollPane.scrollTop < this.grid.dimensions.COL_HEADER_HEIGHT) {
            // otherwise we have to select the whole col.
            this.grid.selection.selectCol(colCandidate, this.grid.dimensions.TOTAL_ROWS);
            this.grid.inputController.commitInputChanges();
            this.grid.drawGrid();
            return;
        }
    }

    public openOverlayEditor(mouseX: number, mouseY: number) {
        const targetRow = this.grid.dimensions.getRowIndexAtY(mouseY);
        const targetCol = this.grid.dimensions.getColIndexAtX(mouseX);

        if (
            this.grid.selection.activeRow === targetRow &&
            this.grid.selection.activeCol === targetCol
        ) {
            this.grid.inputController.positionInputOverlay(targetRow, targetCol);
            this.grid.editor.focusOnCell();
            return;
        }
        if (!this.grid.mouseEventsController.isDraggingSelection) {
            this.grid.selection.select(targetRow, targetCol);
        }
    }

}