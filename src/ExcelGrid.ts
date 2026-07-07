import { SelectionManager } from "./SelectionManager.js";
import { GridDimensions } from "./GridDimensions.js";
import { seedSpreadsheetData } from "./seed.js";
// import { seedSpreadsheetData } from "./seed.js";

export class ExcelGrid {

    private selection = new SelectionManager();
    private dimensions = new GridDimensions();

    private container = document.getElementById('gridContainer') as HTMLDivElement;
    private canvas = document.getElementById('gridCanvas') as HTMLCanvasElement;
    private ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    private scrollPane = document.getElementById('scrollPane') as HTMLDivElement;
    private scrollContent = document.getElementById('scrollContent') as HTMLDivElement;
    private cellInput = document.getElementById('cellInput') as HTMLInputElement;

    private viewportWidth = 0;
    private viewportHeight = 0;

    private isColResizing = false;
    private resizeTargetCol: number | null = null;
    private colResizeStartMouseX = 0;
    private colResizeStartWidth = 0;

    private isRowResizing = false;
    private resizeTargetRow: number | null = null;
    private rowResizeStartMouseY = 0;
    private rowResizeStartHeight = 0;

    constructor() {
        this.init();
        seedSpreadsheetData(this.dimensions);
        this.drawGrid();
    }

    private init(): void {

        // Handles window resize ( responsiveness )
        window.addEventListener('resize', () => this.resizeCanvas());

        // Handles the scrolling of the scroll pane.
        this.scrollPane.addEventListener('scroll', () => this.handleScroll());

        // Handles the clicking of the mouse button ( selecting a cell ).
        this.scrollPane.addEventListener('click', (e) => this.handleMouseClick(e));

        // Handles the intial pressing of the mouse button (starting to drag row/col).
        this.scrollPane.addEventListener('mousedown', (e) => this.handleMouseDown(e));

        // Handles the movement of the mouse button (actively dragging row/col and changing cursor icons from pointer to resize).
        this.scrollPane.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Handles release of the mouse button.
        window.addEventListener('mouseup', () => this.handleMouseUp());

        // Handles the typing of the cell input.
        this.cellInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));

        // Resizes the canvas to the size of the screen.
        this.resizeCanvas();
    }

    private handleMouseDown(e: MouseEvent): void {

        // Gets the X and Y coordinates of the mouse cursor and translates into canvas coordinates by adding the scroll offsets.
        const rect = this.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.scrollPane.scrollLeft;
        const mouseY = e.clientY - rect.top + this.scrollPane.scrollTop;

        // If the mouse is below the column header row and to the left of the row headers that means we are clicking and dragging on the row header.
        if (mouseY > this.dimensions.COL_HEADER_HEIGHT && mouseX < this.dimensions.ROW_HEADER_WIDTH) {

            // which row is our mouse cursor on ? Total number of rows are 100,000 so that means we cannot use a simple loop. 
            // Using binary search we find which row is our candidate.
            const rowCandidate = this.dimensions.getRowIndexAtY(mouseY);

            // get the bottom y position of the row.
            const rowBottomY = this.dimensions.getRowYPosition(rowCandidate) + this.dimensions.getRowHeight(rowCandidate);

            // if the cursor is around 5px of the bottom of the row that means we are expanding the row.
            if (Math.abs(mouseY - rowBottomY) <= 5) {
                this.isRowResizing = true;
                this.resizeTargetRow = rowCandidate;
                this.rowResizeStartMouseY = e.clientY;
                this.rowResizeStartHeight = this.dimensions.getRowHeight(rowCandidate);

                this.commitInputChanges();
                e.preventDefault();
                return;
            }

            
        } else 
             // If the mouse is above col header (less then col height) and right of the row headers that means we are clicking and dragging on the column headers.
            if (mouseY < this.dimensions.COL_HEADER_HEIGHT && mouseX > this.dimensions.ROW_HEADER_WIDTH) {

            // Number of columns are only 500 so we can use simple for loop.
            let currentX = this.dimensions.ROW_HEADER_WIDTH;
            for (let c = 1; c <= this.dimensions.TOTAL_COLS; c++) {
                currentX += this.dimensions.getColWidth(c);

                // if the cursor is around 5px of the right side of the col that means we are expanding the col.
                if (Math.abs(mouseX - currentX) <= 5) {
                    this.isColResizing = true;
                    this.resizeTargetCol = c;
                    this.colResizeStartMouseX = e.clientX;
                    this.colResizeStartWidth = this.dimensions.getColWidth(c);

                    this.commitInputChanges();
                    e.preventDefault();
                    return;
                }
            }

        }



    }

    private handleMouseMove(e: MouseEvent): void {

        // Gets the X and Y coordinates of the mouse cursor and translates into canvas coordinates by adding the scroll offsets.

        const rect = this.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.scrollPane.scrollLeft;
        const mouseY = e.clientY - rect.top + this.scrollPane.scrollTop;


        // if we are resizing the column
        if (this.isColResizing && this.resizeTargetCol !== null) {

            // how much has the column moved ? current position - old position. Set that as the new widht for the column in real time.
            const deltaX = e.clientX - this.colResizeStartMouseX;
            const newWidth = this.colResizeStartWidth + deltaX;

            this.dimensions.setColWidth(this.resizeTargetCol, newWidth);
            this.scrollContent.style.width = `${this.dimensions.getTotalGridWidth()}px`;

            // syncs the grid repaint with monitor's refresh rate to ensure dragging animation is smooth (in built function)
            requestAnimationFrame(() => this.drawGrid());
            return;
        }

        // if we are resizing the row
        if (this.isRowResizing && this.resizeTargetRow !== null) {

            // how much has the row moved ? current position - old position. Set that as the new height for the row in real time.
            const deltaY = e.clientY - this.rowResizeStartMouseY;
            const newHeight = this.rowResizeStartHeight + deltaY;

            this.dimensions.setRowHeight(this.resizeTargetRow, newHeight);
            this.scrollContent.style.height = `${this.dimensions.getTotalGridHeight()}px`;

            // syncs the grid repaint with monitor's refresh rate to ensure dragging animation is smooth (in built function)
            requestAnimationFrame(() => this.drawGrid());
            return;
        }

        // initially cursor icon is default
        let cursorStyle = 'default';

        // if mouse is hovering over our column headers : 
        if (mouseY <= this.dimensions.COL_HEADER_HEIGHT && mouseX >= this.dimensions.ROW_HEADER_WIDTH) {
            let currentX = this.dimensions.ROW_HEADER_WIDTH;

            // we can use for loops since columns are only 500.
            for (let c = 1; c <= this.dimensions.TOTAL_COLS; c++) {
                currentX += this.dimensions.getColWidth(c);

                // if mouse cursor is 5px around the borders of the column change cursor to col-resize.
                if (Math.abs(mouseX - currentX) <= 5) {
                    cursorStyle = 'col-resize';
                    break;
                }
            }
        } else 
            // if mouse is hovering over our row headers we use the binary search and find our candidate: 
            if (mouseY > this.dimensions.COL_HEADER_HEIGHT && mouseX < this.dimensions.ROW_HEADER_WIDTH) {
            const rowCandidate = this.dimensions.getRowIndexAtY(mouseY);
            const rowBottomY = this.dimensions.getRowYPosition(rowCandidate) + this.dimensions.getRowHeight(rowCandidate);

            // if mouse cursor is 5px around the borders of the row change cursor to row-resize.
            if (Math.abs(mouseY - rowBottomY) <= 5) {
                cursorStyle = 'row-resize';
            }
        }

        // actually update the browser cursor to whatever is selected.
        this.scrollPane.style.cursor = cursorStyle;
    }

    // when user leaves the mouse just reset col/row resizing status to false and target col/row to null.
    private handleMouseUp(): void {
        this.isColResizing = false;
        this.resizeTargetCol = null;

        this.isRowResizing = false;
        this.resizeTargetRow = null;
    }


    private resizeCanvas(): void {

        // get the height and width of the screen.
        this.viewportWidth = this.container.clientWidth;
        this.viewportHeight = this.container.clientHeight;

        // get the total height and wdith  of the grid.
        const totalWidth = this.dimensions.getTotalGridWidth();
        const totalHeight = this.dimensions.getTotalGridHeight();

        // get monitor pixel density
        const dpr = window.devicePixelRatio || 1;

        // ensures that the content doesnt overstretch and does not come out to be blurred due to scaling.
        this.canvas.width = this.viewportWidth * dpr;
        this.canvas.height = this.viewportHeight * dpr;
        this.canvas.style.width = `${this.viewportWidth}px`;
        this.canvas.style.height = `${this.viewportHeight}px`;
        this.ctx.scale(dpr, dpr);
        this.scrollContent.style.width = `${totalWidth}px`;
        this.scrollContent.style.height = `${totalHeight}px`;

        this.drawGrid();
    }

    private drawGrid(): void {

        // get scroll position and wipe the canvas clean.
        const scrollLeft = this.scrollPane.scrollLeft;
        const scrollTop = this.scrollPane.scrollTop;
        this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

        // calculate which rows are visible ( row at top of the screen and bottom of the screen )
        const startRow = this.dimensions.getRowIndexAtY(scrollTop);
        const bottomY = scrollTop + this.viewportHeight;
        const endRow = this.dimensions.getRowIndexAtY(bottomY);

        this.ctx.font = "13px Arial";
        this.ctx.textBaseline = "middle";

        // iterate over the visible rows
        for (let r = startRow; r <= endRow; r++) {

            const rowHeight = this.dimensions.getRowHeight(r);
            const cellY = this.dimensions.getRowYPosition(r) - scrollTop;

            let cellX = this.dimensions.ROW_HEADER_WIDTH - scrollLeft;
            for (let c = 1; c <= this.dimensions.TOTAL_COLS; c++) {
                const colWidth = this.dimensions.getColWidth(c);

                // only draw the cell if it is inside the veiwport.
                if (cellX + colWidth >= this.dimensions.ROW_HEADER_WIDTH && cellX <= this.viewportWidth) {

                    // highlight cell if it is selected by user.
                    if (this.selection.isSelected(r, c)) {
                        this.ctx.fillStyle = '#e8f0fe';

                        //                x       y    width      height
                        this.ctx.fillRect(cellX, cellY, colWidth, rowHeight);
                    }

                    // draw the gray borders
                    this.ctx.strokeStyle = "#e0e0e0";
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(cellX, cellY, colWidth, rowHeight);

                    // draw text inside cell.
                    const val = this.dimensions.getCellData(r, c);
                    if (val != "") {
                        this.ctx.save();

                        //long text should not go to next cell.
                        this.ctx.beginPath();
                        this.ctx.rect(cellX + 1, cellY, colWidth - 2, rowHeight);
                        this.ctx.clip();

                        this.ctx.fillStyle = "#333333";
                        this.ctx.textAlign = "left";
                        this.ctx.fillText(val, cellX + 6, cellY + (rowHeight / 2));

                        // remove clipping mask for next cell.
                        this.ctx.restore();
                    }
                }
                cellX += colWidth; // move x to the start of next column
            }
        }

        // background color for cell headers.
        this.ctx.fillStyle = "#f1f3f4";
        this.ctx.fillRect(this.dimensions.ROW_HEADER_WIDTH, 0, this.viewportWidth, this.dimensions.COL_HEADER_HEIGHT);


        // col names
        let headerX = this.dimensions.ROW_HEADER_WIDTH - scrollLeft;
        for (let c = 1; c <= this.dimensions.TOTAL_COLS; c++) {
            const colWidth = this.dimensions.getColWidth(c);

            if (headerX + colWidth >= this.dimensions.ROW_HEADER_WIDTH && headerX <= this.viewportWidth) {
                const isCurrentCol = (this.selection.activeCol === c);

                // if col is active darken backround and turn text blue.
                this.ctx.fillStyle = isCurrentCol ? "#dadce0" : "#f1f3f4";
                this.ctx.fillRect(headerX, 0, colWidth, this.dimensions.COL_HEADER_HEIGHT);

                this.ctx.strokeStyle = "#bbb";
                this.ctx.strokeRect(headerX, 0, colWidth, this.dimensions.COL_HEADER_HEIGHT);
                this.ctx.fillStyle = isCurrentCol ? "#1a73e8" : "#666";
                this.ctx.textAlign = "center";
                this.ctx.fillText(this.dimensions.getCellData(0, c), headerX + (colWidth / 2), this.dimensions.COL_HEADER_HEIGHT / 2);
            }
            headerX += colWidth;
        }

        // background color for row headers.
        this.ctx.fillStyle = "#f1f3f4";
        this.ctx.fillRect(0, this.dimensions.COL_HEADER_HEIGHT, this.dimensions.ROW_HEADER_WIDTH, this.viewportHeight);


        // row numbers
        for (let r = startRow; r <= endRow; r++) {
            const rowHeight = this.dimensions.getRowHeight(r);
            const headerY = this.dimensions.getRowYPosition(r) - scrollTop;
            if (headerY + rowHeight < this.dimensions.COL_HEADER_HEIGHT) continue;

            const isCurrentRow = (this.selection.activeRow === r);

            // if row is active darken backround and turn text blue.
            this.ctx.fillStyle = isCurrentRow ? "#dadce0" : "#f1f3f4";
            this.ctx.fillRect(0, headerY, this.dimensions.ROW_HEADER_WIDTH, rowHeight);

            this.ctx.strokeStyle = "#ccc";
            this.ctx.strokeRect(0, headerY, this.dimensions.ROW_HEADER_WIDTH, rowHeight);
            this.ctx.fillStyle = isCurrentRow ? "#1a73e8" : "#666";
            this.ctx.textAlign = "center";
            this.ctx.fillText(r.toString(), this.dimensions.ROW_HEADER_WIDTH / 2, headerY + (rowHeight / 2));
        }

         // paint the empty square where row and col headers intersect.
        this.ctx.fillStyle = "#e8eaed";
        this.ctx.fillRect(0, 0, this.dimensions.ROW_HEADER_WIDTH, this.dimensions.COL_HEADER_HEIGHT);
        this.ctx.strokeStyle = "#bbb";
        this.ctx.strokeRect(0, 0, this.dimensions.ROW_HEADER_WIDTH, this.dimensions.COL_HEADER_HEIGHT);
    }

    private handleScroll(): void {

        // if a particular cell is selected i.e user is currently and decides to scroll keep the floating input box glued to the correct cell.
        if (this.cellInput.style.display === 'block' && this.selection.activeRow !== null && this.selection.activeCol !== null) {
            this.positionInputOverlay(this.selection.activeRow, this.selection.activeCol);
        }

        // ensures the buttery smooth animation.
        requestAnimationFrame(() => this.drawGrid());
    }

    private handleMouseClick(e: MouseEvent): void {

        // if we are resizing row/col do not allow any mouse clicks.
        if (this.isColResizing) return;
        if (this.isRowResizing) return;


        // get x and y coordinates of the mouse also considering offset.
        const rect = this.container.getBoundingClientRect();
        const clickX = e.clientX - rect.left + this.scrollPane.scrollLeft;
        const clickY = e.clientY - rect.top + this.scrollPane.scrollTop;

        // if user clicks on the row or column headers commit the cell input change. you cannot select and type into headers. 
        if (clickX < this.dimensions.ROW_HEADER_WIDTH || clickY < this.dimensions.COL_HEADER_HEIGHT) {
            this.commitInputChanges();
            return;
        }

        // Find target row based on y position of mouse (and offset)
        const targetRow = this.dimensions.getRowIndexAtY(clickY);

        // Find target col based on x position of mouse (and offset)
        let targetCol = 1;
        let currentX = this.dimensions.ROW_HEADER_WIDTH;
        while (targetCol <= this.dimensions.TOTAL_COLS) {
            const colWidth = this.dimensions.getColWidth(targetCol);
            if (clickX >= currentX && clickX < currentX + colWidth) {
                break;
            }
            currentX += colWidth;
            targetCol++;
        }

        // save data of any old cell that was previously being edited if any.
        this.commitInputChanges();

        // point to the new cell
        this.selection.select(targetRow, targetCol);

        // draw grid
        this.drawGrid();

        // position input box to the new cell.
        this.positionInputOverlay(targetRow, targetCol);
    }

    private positionInputOverlay(row: number, col: number): void {

        // get height and width of the active cell.
        const colWidth = this.dimensions.getColWidth(col);
        const rowHeight = this.dimensions.getRowHeight(row);

        // handle the x and y offset. translate canvas coordinates back to physical screen coordinate. 
        // canvas coordinate ( 5000px from top but physical screen coordinate maybe just 200px from top.)
        const inputX = this.dimensions.getColXPosition(col) - this.scrollPane.scrollLeft;
        const inputY = this.dimensions.getRowYPosition(row) - this.scrollPane.scrollTop;

        // absolute css positioning for the input box and its width and height
        this.cellInput.style.left = `${inputX}px`;
        this.cellInput.style.top = `${inputY}px`;
        this.cellInput.style.width = `${colWidth + 1}px`;
        this.cellInput.style.height = `${rowHeight + 1}px`;

        // put cell's value.
        this.cellInput.value = this.dimensions.getCellData(row, col);
        this.cellInput.style.display = 'block';
        this.cellInput.focus();
    }
    
    private commitInputChanges(): void {

        // if a block is selected to commit input changes set the cell data and hide the input box.
        if (this.cellInput.style.display === 'block' && this.selection.activeRow !== null && this.selection.activeCol !== null) {
            this.dimensions.setCellData(this.selection.activeRow, this.selection.activeCol, this.cellInput.value);
            this.cellInput.style.display = 'none';
        }
    }

    // ability to walk through the cells by keyboard arrow keys. whenever we click an arrow key commit the input changes
    // to not lose text on previous cell, focus, re draw grid and ensure cell is visible ( within the screen)
    private handleInputKeydown(e: KeyboardEvent): void {
        if (e.key === 'Enter') {
            this.commitInputChanges();
            this.scrollPane.focus();
            this.drawGrid();
        } else if (e.key === 'Escape') {
            this.cellInput.style.display = 'none';
            this.drawGrid();
        } else if (e.key === 'ArrowRight') {
            if (this.selection.activeRow != null && this.selection.activeCol != null && this.selection.activeCol != this.dimensions.TOTAL_COLS) {
                this.commitInputChanges();
                this.selection.select(this.selection.activeRow, this.selection.activeCol + 1);
                this.drawGrid();
                this.ensureCellIsVisible(this.selection.activeRow, this.selection.activeCol);
                this.positionInputOverlay(this.selection.activeRow, this.selection.activeCol);
            }
        } else if (e.key === 'ArrowLeft') {
            if (this.selection.activeRow != null && this.selection.activeCol != null && this.selection.activeCol != 1) {
                this.commitInputChanges();
                this.selection.select(this.selection.activeRow, this.selection.activeCol - 1);
                this.drawGrid();
                this.ensureCellIsVisible(this.selection.activeRow, this.selection.activeCol);
                this.positionInputOverlay(this.selection.activeRow, this.selection.activeCol);
            }
        } else if (e.key === 'ArrowDown') {
            if (this.selection.activeRow != null && this.selection.activeCol != null && this.selection.activeRow != this.dimensions.TOTAL_ROWS) {
                this.commitInputChanges();
                this.selection.select(this.selection.activeRow + 1, this.selection.activeCol);
                this.drawGrid();
                this.ensureCellIsVisible(this.selection.activeRow, this.selection.activeCol);
                this.positionInputOverlay(this.selection.activeRow, this.selection.activeCol);
            }
        } else if (e.key === 'ArrowUp') {
            if (this.selection.activeRow != null && this.selection.activeCol != null && this.selection.activeRow != 1) {
                this.commitInputChanges();
                this.selection.select(this.selection.activeRow - 1, this.selection.activeCol);
                this.drawGrid();
                this.ensureCellIsVisible(this.selection.activeRow, this.selection.activeCol);
                this.positionInputOverlay(this.selection.activeRow, this.selection.activeCol);
            }
        }
    }
    
    // ensure the active cell remains within the screen and does not go out of it.
    private ensureCellIsVisible(row: number, col: number): void {
        const colWidth = this.dimensions.getColWidth(col);
        const rowHeight = this.dimensions.getRowHeight(row); 

        const cellLeft = this.dimensions.getColXPosition(col);
        const cellTop = this.dimensions.getRowYPosition(row);

        let newScrollLeft = this.scrollPane.scrollLeft;
        let newScrollTop = this.scrollPane.scrollTop;

        // left boundary
        if (cellLeft < this.scrollPane.scrollLeft + this.dimensions.ROW_HEADER_WIDTH) {
            newScrollLeft = cellLeft - this.dimensions.ROW_HEADER_WIDTH;
        } else 
            // right boundary
            if (cellLeft + colWidth > this.scrollPane.scrollLeft + this.viewportWidth) {
            newScrollLeft = cellLeft + colWidth - this.viewportWidth;
        }

        // top boundary
        if (cellTop < this.scrollPane.scrollTop + this.dimensions.COL_HEADER_HEIGHT) {
            newScrollTop = cellTop - this.dimensions.COL_HEADER_HEIGHT;
        } else
            // bottom boundary
            if (cellTop + rowHeight > this.scrollPane.scrollTop + this.viewportHeight) {
            newScrollTop = cellTop + rowHeight - this.viewportHeight;
        }


        // if the cell was out of bound move scrollbars.
        if (newScrollLeft !== this.scrollPane.scrollLeft) this.scrollPane.scrollLeft = newScrollLeft;
        if (newScrollTop !== this.scrollPane.scrollTop) this.scrollPane.scrollTop = newScrollTop;
    }
}