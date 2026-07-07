import type { ExcelGrid } from "./ExcelGrid.js";

export class InteractionHandler {
    private grid: ExcelGrid;

    // states for resizing columns
    private isColResizing = false;
    private resizeTargetCol: number | null = null;
    private colResizeStartMouseX = 0;
    private colResizeStartWidth = 0;

    // states for resizing rows
    private isRowResizing = false;
    private resizeTargetRow: number | null = null;
    private rowResizeStartMouseY = 0;
    private rowResizeStartHeight = 0;

    // states for selection of cells
    private selectedCellsStartCol = 0;
    private selectedCellsStartRow = 0;
    private isDraggingSelection = false;

    // additinoal flags to distinguish click vs drag to select
    private justDragged = false;
    private preventNextClick = false;

    constructor(grid: ExcelGrid) {
        this.grid = grid;
    }

    public bindEvents(): void {
        this.grid.scrollPane.addEventListener('scroll', () => this.handleScroll());
        this.grid.scrollPane.addEventListener('click', (e) => this.handleMouseClick(e));
        this.grid.scrollPane.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.grid.scrollPane.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.grid.cellInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
    }

    private handleScroll(): void {
        // if a cell is being edited (input box is visible) and the user scrolls down change the coordinates
        //  of input box to keep it glued to its original cell position.
        if (
            this.grid.editor.isEditing() &&
            this.grid.selection.activeRow != null &&
            this.grid.selection.activeCol != null
        ) {
            this.positionInputOverlay(this.grid.selection.activeRow, this.grid.selection.activeCol);
        }
        requestAnimationFrame(() => this.grid.drawGrid());
    }

    // helper function to position the input box
    private positionInputOverlay(row: number, col: number): void {
        const colWidth = this.grid.dimensions.getColWidth(col);
        const rowHeight = this.grid.dimensions.getRowHeight(row);
        const inputX = this.grid.dimensions.getColXPosition(col) - this.grid.scrollPane.scrollLeft;
        const inputY = this.grid.dimensions.getRowYPosition(row) - this.grid.scrollPane.scrollTop;
        const val = this.grid.dataStore.getCellData(row, col);
        this.grid.editor.show(inputX, inputY, colWidth, rowHeight, val);
    }

    private handleMouseDown(e: MouseEvent): void {
        const rect = this.grid.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.grid.scrollPane.scrollLeft;
        const mouseY = e.clientY - rect.top + this.grid.scrollPane.scrollTop;

        // If the mouse is below the column header row and to the left of the row headers that means
        // we are clicking and dragging on the row header.
        if (mouseY > this.grid.dimensions.COL_HEADER_HEIGHT && mouseX < this.grid.dimensions.ROW_HEADER_WIDTH) {

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

                this.commitInputChanges();
                e.preventDefault();
                return;
            }
            // Resize row if close to top border of candidate (previous row's bottom border)
            else if (rowCandidate > 1 && Math.abs(mouseY - rowY) <= 5) {
                this.isRowResizing = true;
                this.resizeTargetRow = rowCandidate - 1;
                this.rowResizeStartMouseY = e.clientY;
                this.rowResizeStartHeight = this.grid.dimensions.getRowHeight(rowCandidate - 1);
                this.commitInputChanges();
                e.preventDefault();
                return;
            }
            // otherwise we have to select the whole row.
            this.grid.selection.selectRow(rowCandidate, this.grid.dimensions.TOTAL_COLS);
            this.commitInputChanges();
            this.grid.drawGrid();
            return;
        }



        // If the mouse is above col header (less then col height) and right of the row headers
        //  that means we are clicking and dragging on the column headers.
        if (mouseY < this.grid.dimensions.COL_HEADER_HEIGHT && mouseX > this.grid.dimensions.ROW_HEADER_WIDTH) {
            const colCandidate = this.grid.dimensions.getColIndexAtX(mouseX);
            const colX = this.grid.dimensions.getColXPosition(colCandidate);
            const colWidth = this.grid.dimensions.getColWidth(colCandidate);

            // if the cursor is around 5px of the right side of the col that means we are expanding the col.
            if (Math.abs(mouseX - (colX + colWidth)) <= 5) {
                this.isColResizing = true;
                this.resizeTargetCol = colCandidate;
                this.colResizeStartMouseX = e.clientX;
                this.colResizeStartWidth = colWidth;

                this.commitInputChanges();
                e.preventDefault();
                return;
            }
            else if (colCandidate > 1 && Math.abs(mouseX - colX) <= 5) {
                // If the cursor is 5px from the left of the current column 
                // that means we are expanding the previous column. 
                // (because the left border of the current column is the right border of the previous column)
                this.isColResizing = true;
                this.resizeTargetCol = colCandidate - 1;
                this.colResizeStartMouseX = e.clientX;
                this.colResizeStartWidth = this.grid.dimensions.getColWidth(colCandidate - 1);

                this.commitInputChanges();
                e.preventDefault();
                return;
            }

            // otherwise we have to select the whole row.
            this.grid.selection.selectCol(colCandidate, this.grid.dimensions.TOTAL_ROWS);
            this.commitInputChanges();
            this.grid.drawGrid();
            return;
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

    private handleMouseMove(e: MouseEvent): void {
        const rect = this.grid.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.grid.scrollPane.scrollLeft;
        const mouseY = e.clientY - rect.top + this.grid.scrollPane.scrollTop;

        // if we are resizing the column
        if (this.isColResizing && this.resizeTargetCol !== null) {

            // how much has the column moved ? current position - old position. 
            // Set that as the new widht for the column in real time.
            const deltaX = e.clientX - this.colResizeStartMouseX;
            const newWidth = this.colResizeStartWidth + deltaX;

            this.grid.dimensions.setColWidth(this.resizeTargetCol, newWidth);
            this.grid.scrollContent.style.width = `${this.grid.dimensions.getTotalGridWidth()}px`;
            requestAnimationFrame(() => this.grid.drawGrid());
            return;
        }

        // if we are resizing the row
        if (this.isRowResizing && this.resizeTargetRow !== null) {
            // how much has the row moved ? current position - old position.
            //  Set that as the new height for the row in real time.
            const deltaY = e.clientY - this.rowResizeStartMouseY;
            const newHeight = this.rowResizeStartHeight + deltaY;

            this.grid.dimensions.setRowHeight(this.resizeTargetRow, newHeight);
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

            if (Math.abs(mouseX - (colX + colWidth)) <= 5 || (colCandidate > 1 && Math.abs(mouseX - colX) <= 5)) {
                cursorStyle = 'col-resize';
            }
        } else if (mouseY > this.grid.dimensions.COL_HEADER_HEIGHT && mouseX < this.grid.dimensions.ROW_HEADER_WIDTH) {
            const rowCandidate = this.grid.dimensions.getRowIndexAtY(mouseY);
            const rowY = this.grid.dimensions.getRowYPosition(rowCandidate);
            const rowHeight = this.grid.dimensions.getRowHeight(rowCandidate);
            const rowBottomY = rowY + rowHeight;
            if (Math.abs(mouseY - rowBottomY) <= 5 || (rowCandidate > 1 && Math.abs(mouseY - rowY) <= 5)) {
                cursorStyle = 'row-resize';
            }
        }

        this.grid.scrollPane.style.cursor = cursorStyle;
    }

    private handleMouseUp(e: MouseEvent): void {
        this.isColResizing = false;
        this.resizeTargetCol = null;

        this.isRowResizing = false;
        this.resizeTargetRow = null;

        // both will be true if user has dragged multiple cells.
        if (this.isDraggingSelection && this.justDragged) {
            this.preventNextClick = true;
        }

        this.isDraggingSelection = false;
    }

    private handleMouseClick(e: MouseEvent): void {
        if (this.preventNextClick) {
            this.preventNextClick = false;
            return;
        }

        if (this.isColResizing || this.isRowResizing) return;

        const rect = this.grid.container.getBoundingClientRect();
        const clickX = e.clientX - rect.left + this.grid.scrollPane.scrollLeft;
        const clickY = e.clientY - rect.top + this.grid.scrollPane.scrollTop;

        // Clicked on headers commits input and exits
        if (clickX < this.grid.dimensions.ROW_HEADER_WIDTH || clickY < this.grid.dimensions.COL_HEADER_HEIGHT) {
            this.commitInputChanges();
            return;
        }

        const targetRow = this.grid.dimensions.getRowIndexAtY(clickY);
        const targetCol = this.grid.dimensions.getColIndexAtX(clickX);

        this.commitInputChanges();

        // If clicking on an already-selected active cell, open the overlay editor
        if (
            this.grid.selection.activeRow === targetRow &&
            this.grid.selection.activeCol === targetCol
        ) {
            this.positionInputOverlay(targetRow, targetCol);
            return;
        }

        this.grid.selection.select(targetRow, targetCol);
        this.grid.drawGrid();
    }

    private handleInputKeydown(e: KeyboardEvent): void {
        if (e.key === 'Enter') {
            this.commitInputChanges();
            this.grid.scrollPane.focus();
            this.grid.drawGrid();
        } else if (e.key === 'Escape') {
            this.grid.editor.hide();
            this.grid.drawGrid();
        } else if (e.key === 'ArrowRight') {
            this.navigate(0, 1);
        } else if (e.key === 'ArrowLeft') {
            this.navigate(0, -1);
        } else if (e.key === 'ArrowDown') {
            this.navigate(1, 0);
        } else if (e.key === 'ArrowUp') {
            this.navigate(-1, 0);
        }
    }

    private navigate(rowOffset: number, colOffset: number): void {
        const activeRow = this.grid.selection.activeRow;
        const activeCol = this.grid.selection.activeCol;

        if (activeRow === null || activeCol === null) return;

        const nextRow = activeRow + rowOffset;
        const nextCol = activeCol + colOffset;

        if (
            nextRow >= 1 && nextRow <= this.grid.dimensions.TOTAL_ROWS &&
            nextCol >= 1 && nextCol <= this.grid.dimensions.TOTAL_COLS
        ) {
            this.commitInputChanges();
            this.grid.selection.select(nextRow, nextCol);
            this.grid.drawGrid();
            this.ensureCellIsVisible(nextRow, nextCol);
            this.positionInputOverlay(nextRow, nextCol);
        }
    }

    private commitInputChanges(): void {
        const activeRow = this.grid.selection.activeRow;
        const activeCol = this.grid.selection.activeCol;

        if (this.grid.editor.isEditing() && activeRow !== null && activeCol !== null) {
            this.grid.dataStore.setCellData(activeRow, activeCol, this.grid.editor.getValue());
            this.grid.editor.hide();
        }
    }

    private ensureCellIsVisible(row: number, col: number): void {
        const colWidth = this.grid.dimensions.getColWidth(col);
        const rowHeight = this.grid.dimensions.getRowHeight(row);
        const cellLeft = this.grid.dimensions.getColXPosition(col);
        const cellTop = this.grid.dimensions.getRowYPosition(row);

        const viewportWidth = this.grid.container.clientWidth;
        const viewportHeight = this.grid.container.clientHeight;

        let newScrollLeft = this.grid.scrollPane.scrollLeft;
        let newScrollTop = this.grid.scrollPane.scrollTop;

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
        } else if (cellTop + rowHeight > this.grid.scrollPane.scrollTop + viewportHeight) {
            newScrollTop = cellTop + rowHeight - viewportHeight;
        }

        if (newScrollLeft !== this.grid.scrollPane.scrollLeft) this.grid.scrollPane.scrollLeft = newScrollLeft;
        if (newScrollTop !== this.grid.scrollPane.scrollTop) this.grid.scrollPane.scrollTop = newScrollTop;
    }


}