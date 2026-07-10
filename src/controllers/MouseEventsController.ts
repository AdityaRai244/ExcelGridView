import { ResizeColCommand } from "../command/ResizeColCommand.js";
import { ResizeRowCommand } from "../command/ResizeRowCommand.js";
import type { ExcelGrid } from "../ExcelGrid.js";

export class MouseEventsController {

    constructor(private grid: ExcelGrid) { }

    private selectedCellsStartCol = 0;
    private selectedCellsStartRow = 0;
    private isDraggingSelection = false;

    // additinoal flags to distinguish click vs drag to select
    private justDragged = false;
    private preventNextClick = false;

    private colOriginalWidthBeforeDrag = 0;
    private rowOriginalHeightBeforeDrag = 0;


    public handleMouseDown(e: MouseEvent): void {

        const rect = this.grid.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.grid.scrollPane.scrollLeft;
        const mouseY = e.clientY - rect.top + this.grid.scrollPane.scrollTop;

        this.grid.rowResizeController.handleRowResize(e, mouseY);

        this.grid.colResizeController.handleColResize(e, mouseX, mouseY);

        if (this.grid.colResizeController.isColResizing && this.grid.colResizeController.resizeTargetCol !== null) {
            this.colOriginalWidthBeforeDrag = this.grid.dimensions.getColWidth(this.grid.colResizeController.resizeTargetCol);
        }

        if (this.grid.rowResizeController.isRowResizing && this.grid.rowResizeController.resizeTargetRow !== null) {
            this.rowOriginalHeightBeforeDrag = this.grid.dimensions.getRowHeight(this.grid.rowResizeController.resizeTargetRow);
        }

        // we are selecting cells
        if (mouseX >= this.grid.dimensions.ROW_HEADER_WIDTH && mouseY >= this.grid.dimensions.COL_HEADER_HEIGHT) {
            const targetRow = this.grid.dimensions.getRowIndexAtY(mouseY);
            const targetCol = this.grid.dimensions.getColIndexAtX(mouseX);

            this.selectedCellsStartRow = targetRow;
            this.selectedCellsStartCol = targetCol;
            this.isDraggingSelection = true;
            this.justDragged = false;

        }

    }

    public handleMouseMove(e: MouseEvent): void {
        const rect = this.grid.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.grid.scrollPane.scrollLeft;
        const mouseY = e.clientY - rect.top + this.grid.scrollPane.scrollTop;

        // if we are resizing the column
        if (this.grid.colResizeController.isColResizing && this.grid.colResizeController.resizeTargetCol !== null) {

            // how much has the column moved ? current position - old position. 
            // Set that as the new widht for the column in real time.
            const deltaX = e.clientX - this.grid.colResizeController.colResizeStartMouseX;
            const newWidth = this.grid.colResizeController.colResizeStartWidth + deltaX;

            // const command = new ResizeColCommand(this.grid,this.grid.colResizeController.resizeTargetCol,newWidth);
            // this.grid.commandController.executeCommand(command);

            this.grid.dimensions.setColWidth(this.grid.colResizeController.resizeTargetCol, newWidth);
            this.grid.scrollContent.style.width = `${this.grid.dimensions.getTotalGridWidth()}px`;
            requestAnimationFrame(() => this.grid.drawGrid());
            return;
        }

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

        //if we are selecting cells
        if (this.isDraggingSelection) {
            const targetRow = this.grid.dimensions.getRowIndexAtY(mouseY);
            const targetCol = this.grid.dimensions.getColIndexAtX(mouseX);

            // if the mouse moved outside the cell make justdragged true.
            if (targetRow !== this.selectedCellsStartRow || targetCol !== this.selectedCellsStartCol) {
                this.justDragged = true;
            }
            this.grid.selection.selectMultiple(this.selectedCellsStartRow, this.selectedCellsStartCol, targetRow, targetCol);
            requestAnimationFrame(() => this.grid.drawGrid());
            return;
        }

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

    public handleMouseUp(e: MouseEvent): void {

        const rect = this.grid.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.grid.scrollPane.scrollLeft;
        const mouseY = e.clientY - rect.top + this.grid.scrollPane.scrollTop;

        if (this.justDragged) {
            const targetRow = this.grid.dimensions.getRowIndexAtY(mouseY);
            const targetCol = this.grid.dimensions.getColIndexAtX(mouseX);

            if (this.grid.editor.isFormulaEntered) {
                const args = `${this.grid.dimensions.getExcelColumnLabel(this.selectedCellsStartCol)}${this.selectedCellsStartRow}:${this.grid.dimensions.getExcelColumnLabel(targetCol)}${targetRow}`
                this.grid.editor.appendValue(args);
                this.preventNextClick = true;
                this.isDraggingSelection = false;
                return;
            }
        }

        if (this.grid.colResizeController.isColResizing && this.grid.colResizeController.resizeTargetCol !== null) {
            const col = this.grid.colResizeController.resizeTargetCol;
            const finalWidth = this.grid.dimensions.getColWidth(col);

            if (finalWidth !== this.colOriginalWidthBeforeDrag) {
                const command = new ResizeColCommand(
                    this.grid,
                    col,
                    this.colOriginalWidthBeforeDrag,
                    finalWidth
                );

                this.grid.commandController.executeCommand(command);
            }
        }

        if (this.grid.rowResizeController.isRowResizing && this.grid.rowResizeController.resizeTargetRow !== null) {
            const row = this.grid.rowResizeController.resizeTargetRow;
            const finalHeight = this.grid.dimensions.getRowHeight(row);

            if (finalHeight !== this.rowOriginalHeightBeforeDrag) {
                const command = new ResizeRowCommand(
                    this.grid,
                    row,
                    this.rowOriginalHeightBeforeDrag,
                    finalHeight
                );

                this.grid.commandController.executeCommand(command);
            }
        }

        this.grid.colResizeController.isColResizing = false;
        this.grid.colResizeController.resizeTargetCol = null;

        this.grid.rowResizeController.isRowResizing = false;
        this.grid.rowResizeController.resizeTargetRow = null;

        if (this.isDraggingSelection && this.justDragged) {
            this.preventNextClick = true;
        }

        this.grid.editor.focusOnCell();
        this.isDraggingSelection = false;
    }

    public handleMouseClick(e: MouseEvent): void {


        if (this.preventNextClick) {
            this.preventNextClick = false;
            return;
        }

        if (this.grid.colResizeController.isColResizing || this.grid.rowResizeController.isRowResizing) return;

        const rect = this.grid.container.getBoundingClientRect();
        const clickX = e.clientX - rect.left + this.grid.scrollPane.scrollLeft;
        const clickY = e.clientY - rect.top + this.grid.scrollPane.scrollTop;

        const rowCandidate = this.grid.dimensions.getRowIndexAtY(clickY);
        const colCandidate = this.grid.dimensions.getColIndexAtX(clickX);

        if (clickX - this.grid.scrollPane.scrollLeft < this.grid.dimensions.ROW_HEADER_WIDTH) {
            // otherwise we have to select the whole row.
            this.grid.selection.selectRow(rowCandidate, this.grid.dimensions.TOTAL_COLS);
            this.grid.inputController.commitInputChanges();
            this.grid.drawGrid();
            return;
        }
        if (clickY - this.grid.scrollPane.scrollTop < this.grid.dimensions.COL_HEADER_HEIGHT) {

            // otherwise we have to select the whole col.
            this.grid.selection.selectCol(colCandidate, this.grid.dimensions.TOTAL_ROWS);
            this.grid.inputController.commitInputChanges();
            this.grid.drawGrid();
            return;
        }

        const targetRow = this.grid.dimensions.getRowIndexAtY(clickY);
        const targetCol = this.grid.dimensions.getColIndexAtX(clickX);
        this.grid.inputController.commitInputChanges();

        // If clicking on an already-selected active cell, open the overlay editor
        if (
            this.grid.selection.activeRow === targetRow &&
            this.grid.selection.activeCol === targetCol
        ) {
            this.grid.inputController.positionInputOverlay(targetRow, targetCol);
            this.grid.editor.focusOnCell();
            return;
        }
        if (!this.isDraggingSelection) {
            this.grid.selection.select(targetRow, targetCol);
        }
        this.grid.drawGrid();
    }


}