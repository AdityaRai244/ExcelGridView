import type { ExcelGrid } from "../ExcelGrid.js";

export class CellController {

    constructor(private grid: ExcelGrid) { }

    public navigateCells(rowOffset: number, colOffset: number): void {
        const activeRow = this.grid.selection.activeRow;
        const activeCol = this.grid.selection.activeCol;

        if (activeRow === null || activeCol === null) return;

        const nextRow = activeRow + rowOffset;
        const nextCol = activeCol + colOffset;

        if (
            nextRow >= 1 && nextRow <= this.grid.dimensions.TOTAL_ROWS &&
            nextCol >= 1 && nextCol <= this.grid.dimensions.TOTAL_COLS
        ) {
            this.grid.selection.select(nextRow, nextCol);
            this.grid.drawGrid();
            this.ensureCellIsVisible(nextRow, nextCol);
        }
    }

    public ensureCellIsVisible(row: number, col: number): void {
        const colWidth = this.grid.dimensions.getColWidth(col);
        const rowHeight = this.grid.dimensions.getRowHeight(row);
        const cellLeft = this.grid.dimensions.getColXPosition(col);
        const cellTop = this.grid.dimensions.getRowYPosition(row);

        const viewportWidth = this.grid.container.clientWidth;
        const viewportHeight = this.grid.container.clientHeight;

        let newScrollLeft = this.grid.scrollPane.scrollLeft;
        let newScrollTop = this.grid.scrollPane.scrollTop;

        console.log(cellTop, newScrollTop, viewportHeight);

        // Left border scroll correction
        if (cellLeft < this.grid.scrollPane.scrollLeft + this.grid.dimensions.ROW_HEADER_WIDTH) {
            newScrollLeft = cellLeft - this.grid.dimensions.ROW_HEADER_WIDTH;
        }
        // Right border scroll correction
        else if (cellLeft + colWidth > this.grid.scrollPane.scrollLeft + viewportWidth) {
            newScrollLeft = cellLeft + colWidth - viewportWidth;
        }

        // Bottom/Top border scroll correction
        if (cellTop < this.grid.scrollPane.scrollTop + this.grid.dimensions.COL_HEADER_HEIGHT) {
            newScrollTop = cellTop - this.grid.dimensions.COL_HEADER_HEIGHT;
            console.log({ cellTop, scpTop: this.grid.scrollPane.scrollTop, chh: this.grid.dimensions.COL_HEADER_HEIGHT })
        } else if (cellTop + rowHeight * 5 > this.grid.scrollPane.scrollTop + viewportHeight) {
            console.log("Etneterfd")
            console.log({ cellTop, rowHeight, viewportHeight, scpTop: this.grid.scrollPane.scrollTop, chh: this.grid.dimensions.COL_HEADER_HEIGHT })
            newScrollTop = cellTop + rowHeight * 5 - viewportHeight;
            console.log(newScrollTop, "ASdf");
        }

        if (newScrollLeft !== this.grid.scrollPane.scrollLeft) this.grid.scrollPane.scrollLeft = newScrollLeft;
        if (newScrollTop !== this.grid.scrollPane.scrollTop) {
            this.grid.scrollPane.scrollTop = newScrollTop;
        }
    }


    public moveSelectedCell(e: KeyboardEvent) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isModifierPressed = isMac ? e.metaKey : e.ctrlKey;

        if (isModifierPressed) {
            const key = e.key.toLowerCase();

            if (key === 'z') {
                e.preventDefault();

                if (isMac && e.shiftKey) {
                    this.grid.commandController.redo();
                } else {
                    this.grid.commandController.undo();
                }
                return;
            }

            if (!isMac && key === 'y') {
                e.preventDefault();
                this.grid.commandController.redo();
                return;
            }
        }

        if (this.grid.selection.activeRow === null || this.grid.selection.activeCol === null || this.grid.editor.isEditing()) {
            return;
        }
        e.preventDefault();
        if (e.key === 'ArrowRight') {
            this.grid.cellController.navigateCells(0, 1);
        } else if (e.key === 'ArrowLeft') {
            this.grid.cellController.navigateCells(0, -1);
        } else if (e.key === 'ArrowDown') {
            this.grid.cellController.navigateCells(1, 0);
        } else if (e.key === 'ArrowUp') {
            this.grid.cellController.navigateCells(-1, 0);
        }
    }

    public cellSelect(mouseX: number, mouseY: number) {

        if (this.grid.colResizeController.isColResizing && this.grid.colResizeController.resizeTargetCol !== null) {
            this.grid.mouseEventsController.colOriginalWidthBeforeDrag = this.grid.dimensions.getColWidth(this.grid.colResizeController.resizeTargetCol);
        }

        if (this.grid.rowResizeController.isRowResizing && this.grid.rowResizeController.resizeTargetRow !== null) {
            this.grid.mouseEventsController.rowOriginalHeightBeforeDrag = this.grid.dimensions.getRowHeight(this.grid.rowResizeController.resizeTargetRow);
        }

        // we are selecting cells
        if (mouseX >= this.grid.dimensions.ROW_HEADER_WIDTH && mouseY >= this.grid.dimensions.COL_HEADER_HEIGHT) {
            const targetRow = this.grid.dimensions.getRowIndexAtY(mouseY);
            const targetCol = this.grid.dimensions.getColIndexAtX(mouseX);

            this.grid.mouseEventsController.selectedCellsStartRow = targetRow;
            this.grid.mouseEventsController.selectedCellsStartCol = targetCol;
            this.grid.mouseEventsController.isDraggingSelection = true;
            this.grid.mouseEventsController.justDragged = false;

        }
    }

    public cellSelectMove(e: MouseEvent, mouseX: number, mouseY: number) {
        //if we are selecting cells
        if (this.grid.mouseEventsController.isDraggingSelection) {
            const targetRow = this.grid.dimensions.getRowIndexAtY(mouseY);
            const targetCol = this.grid.dimensions.getColIndexAtX(mouseX);

            // if the mouse moved outside the cell make justdragged true.
            if (targetRow !== this.grid.mouseEventsController.selectedCellsStartRow || targetCol !== this.grid.mouseEventsController.selectedCellsStartCol) {
                this.grid.mouseEventsController.justDragged = true;
            }
            this.grid.selection.selectMultiple(this.grid.mouseEventsController.selectedCellsStartRow, this.grid.mouseEventsController.selectedCellsStartCol, targetRow, targetCol);
            const args = `${this.grid.dimensions.getExcelColumnLabel(this.grid.mouseEventsController.selectedCellsStartCol)}${this.grid.mouseEventsController.selectedCellsStartRow}:${this.grid.dimensions.getExcelColumnLabel(targetCol)}${targetRow}`
            this.grid.summaryController.calculateSummary(args);

            requestAnimationFrame(() => this.grid.drawGrid());
            return;
        }
    }

    public appendSelectedCells(mouseX: number, mouseY: number) {
        if (this.grid.mouseEventsController.justDragged) {
            const targetRow = this.grid.dimensions.getRowIndexAtY(mouseY);
            const targetCol = this.grid.dimensions.getColIndexAtX(mouseX);
            const args = `${this.grid.dimensions.getExcelColumnLabel(this.grid.mouseEventsController.selectedCellsStartCol)}${this.grid.mouseEventsController.selectedCellsStartRow}:${this.grid.dimensions.getExcelColumnLabel(targetCol)}${targetRow}`

            if (this.grid.editor.isFormulaEntered) {
                this.grid.editor.appendValue(args);
                this.grid.mouseEventsController.preventNextClick = true;
                this.grid.mouseEventsController.isDraggingSelection = false;
                return;
            }
        }
    }


}