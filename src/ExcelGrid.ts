import { SelectionManager } from "./SelectionManager.js";
import { GridDimensions } from "./GridDimensions.js";

export class ExcelGrid {
    // Connect our decoupled structural manager entities
    private selection = new SelectionManager();
    private dimensions = new GridDimensions();

    // Grab viewport DOM element node handles
    private container = document.getElementById('gridContainer') as HTMLDivElement;
    private canvas = document.getElementById('gridCanvas') as HTMLCanvasElement;
    private ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    private scrollPane = document.getElementById('scrollPane') as HTMLDivElement;
    private scrollContent = document.getElementById('scrollContent') as HTMLDivElement;
    private cellInput = document.getElementById('cellInput') as HTMLInputElement;

    private viewportWidth = 0;
    private viewportHeight = 0;

    private isResizing = false;
    private resizeTargetCol: number | null = null;
    private resizeStartMouseX = 0;
    private resizeStartWidth = 0;

    constructor() {
        this.init();
    }

    private init(): void {
        window.addEventListener('resize', () => this.resizeCanvas());
        this.scrollPane.addEventListener('scroll', () => this.handleScroll());
        this.cellInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));

        this.scrollPane.addEventListener('click', (e) => this.handleMouseClick(e));
        this.scrollPane.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.scrollPane.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', () => this.handleMouseUp());

        this.resizeCanvas();
    }

    private handleMouseDown(e: MouseEvent): void {
        const rect = this.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.scrollPane.scrollLeft;
        const mouseY = e.clientY - rect.top + this.scrollPane.scrollTop;

        // Only allow resizing if clicking inside the top column header row
        if (mouseY > this.dimensions.COL_HEADER_HEIGHT || mouseX < this.dimensions.ROW_HEADER_WIDTH) return;

        // Loop through visible columns to see if we clicked near a border (within 5 pixels)
        let currentX = this.dimensions.ROW_HEADER_WIDTH;
        for (let c = 1; c <= this.dimensions.TOTAL_COLS; c++) {
            currentX += this.dimensions.getColWidth(c);

            if (Math.abs(mouseX - currentX) <= 5) {
                this.isResizing = true;
                this.resizeTargetCol = c;
                this.resizeStartMouseX = e.clientX;
                this.resizeStartWidth = this.dimensions.getColWidth(c);

                this.commitInputChanges();
                e.preventDefault();
                return;
            }
        }
    }

    private handleMouseMove(e: MouseEvent): void {
        const rect = this.container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + this.scrollPane.scrollLeft;
        const mouseY = e.clientY - rect.top + this.scrollPane.scrollTop;

        // 1. IF RESIZING IS ACTIVE: Calculate the delta and live-update the width
        if (this.isResizing && this.resizeTargetCol !== null) {
            const deltaX = e.clientX - this.resizeStartMouseX;
            const newWidth = this.resizeStartWidth + deltaX;

            this.dimensions.setColWidth(this.resizeTargetCol, newWidth);

            // Re-inflate the phantom scroll content width dynamically as column expands
            const totalWidth = this.dimensions.getTotalGridWidth();
            this.scrollContent.style.width = `${totalWidth}px`;

            // Repaint the updated frame cleanly
            requestAnimationFrame(() => this.drawGrid());
            return;
        }

        // 2. IF NOT RESIZING: Change mouse cursor icon when floating over a border edge
        if (mouseY <= this.dimensions.COL_HEADER_HEIGHT && mouseX >= this.dimensions.ROW_HEADER_WIDTH) {
            let currentX = this.dimensions.ROW_HEADER_WIDTH;
            let nearBorder = false;

            for (let c = 1; c <= this.dimensions.TOTAL_COLS; c++) {
                currentX += this.dimensions.getColWidth(c);
                if (Math.abs(mouseX - currentX) <= 5) {
                    nearBorder = true;
                    break;
                }
            }
            this.scrollPane.style.cursor = nearBorder ? 'col-resize' : 'default';
        } else {
            this.scrollPane.style.cursor = 'default';
        }
    }

    private handleMouseUp(): void {
        this.isResizing = false;
        this.resizeTargetCol = null;
    }


    private resizeCanvas(): void {
        this.viewportWidth = this.container.clientWidth;
        this.viewportHeight = this.container.clientHeight;

        // DYNAMIC WIDTH ACCUMULATION
        const totalWidth = this.dimensions.getTotalGridWidth();
        const totalHeight = this.dimensions.COL_HEADER_HEIGHT + (this.dimensions.TOTAL_ROWS * this.dimensions.ROW_HEIGHT);

        const dpr = window.devicePixelRatio || 1;
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
        const scrollLeft = this.scrollPane.scrollLeft;
        const scrollTop = this.scrollPane.scrollTop;

        this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

        const startRow = Math.max(1, Math.floor((scrollTop - this.dimensions.COL_HEADER_HEIGHT) / this.dimensions.ROW_HEIGHT));
        const endRow = Math.min(this.dimensions.TOTAL_ROWS, startRow + Math.ceil(this.viewportHeight / this.dimensions.ROW_HEIGHT) + 1);

        this.ctx.font = "13px Arial";
        this.ctx.textBaseline = "middle";

        // 1. CELLS DRAW LOOP
        for (let r = startRow; r <= endRow; r++) {
            const cellY = this.dimensions.COL_HEADER_HEIGHT + (r - 1) * this.dimensions.ROW_HEIGHT - scrollTop;

            let cellX = this.dimensions.ROW_HEADER_WIDTH - scrollLeft;
            for (let c = 1; c <= this.dimensions.TOTAL_COLS; c++) {
                const colWidth = this.dimensions.getColWidth(c);

                // Virtual Culling optimization: Only paint if the column is physically inside the viewport
                if (cellX + colWidth >= this.dimensions.ROW_HEADER_WIDTH && cellX <= this.viewportWidth) {
                    if (this.selection.isSelected(r, c)) {
                        this.ctx.fillStyle = '#e8f0fe';
                        this.ctx.fillRect(cellX, cellY, colWidth, this.dimensions.ROW_HEIGHT);
                    }

                    this.ctx.strokeStyle = "#e0e0e0";
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(cellX, cellY, colWidth, this.dimensions.ROW_HEIGHT);

                    const val = this.dimensions.getCellData(r, c);
                    if (val != "") {
                        this.ctx.save();
                        this.ctx.beginPath();
                        this.ctx.rect(cellX + 1, cellY, colWidth - 2, this.dimensions.ROW_HEIGHT);
                        this.ctx.clip();

                        this.ctx.fillStyle = "#333333";
                        this.ctx.textAlign = "left";
                        this.ctx.fillText(val, cellX + 6, cellY + (this.dimensions.ROW_HEIGHT / 2));

                        this.ctx.restore();
                    }
                }
                cellX += colWidth;
            }
        }

        // 2. COLUMN HEADERS (A, B, C...)
        this.ctx.fillStyle = "#f1f3f4";
        this.ctx.fillRect(this.dimensions.ROW_HEADER_WIDTH, 0, this.viewportWidth, this.dimensions.COL_HEADER_HEIGHT);

        let headerX = this.dimensions.ROW_HEADER_WIDTH - scrollLeft;
        for (let c = 1; c <= this.dimensions.TOTAL_COLS; c++) {
            const colWidth = this.dimensions.getColWidth(c);

            if (headerX + colWidth >= this.dimensions.ROW_HEADER_WIDTH && headerX <= this.viewportWidth) {
                const isCurrentCol = (this.selection.activeCol === c);
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

        // 3. ROW HEADERS (1, 2, 3...)
        this.ctx.fillStyle = "#f1f3f4";
        this.ctx.fillRect(0, this.dimensions.COL_HEADER_HEIGHT, this.dimensions.ROW_HEADER_WIDTH, this.viewportHeight);
        for (let r = startRow; r <= endRow; r++) {
            const headerY = this.dimensions.COL_HEADER_HEIGHT + (r - 1) * this.dimensions.ROW_HEIGHT - scrollTop;
            if (headerY + this.dimensions.ROW_HEIGHT < this.dimensions.COL_HEADER_HEIGHT) continue;

            const isCurrentRow = (this.selection.activeRow === r);
            this.ctx.fillStyle = isCurrentRow ? "#dadce0" : "#f1f3f4";
            this.ctx.fillRect(0, headerY, this.dimensions.ROW_HEADER_WIDTH, this.dimensions.ROW_HEIGHT);

            this.ctx.strokeStyle = "#ccc";
            this.ctx.strokeRect(0, headerY, this.dimensions.ROW_HEADER_WIDTH, this.dimensions.ROW_HEIGHT);
            this.ctx.fillStyle = isCurrentRow ? "#1a73e8" : "#666";
            this.ctx.textAlign = "center";
            this.ctx.fillText(r.toString(), this.dimensions.ROW_HEADER_WIDTH / 2, headerY + (this.dimensions.ROW_HEIGHT / 2));
        }

        // 4. CORNER ANCHOR BLOCK
        this.ctx.fillStyle = "#e8eaed";
        this.ctx.fillRect(0, 0, this.dimensions.ROW_HEADER_WIDTH, this.dimensions.COL_HEADER_HEIGHT);
        this.ctx.strokeStyle = "#bbb";
        this.ctx.strokeRect(0, 0, this.dimensions.ROW_HEADER_WIDTH, this.dimensions.COL_HEADER_HEIGHT);
    }


    private handleScroll(): void {
        if (this.cellInput.style.display === 'block' && this.selection.activeRow !== null && this.selection.activeCol !== null) {
            this.positionInputOverlay(this.selection.activeRow, this.selection.activeCol);
        }
        requestAnimationFrame(() => this.drawGrid());
    }

    private handleMouseClick(e: MouseEvent): void {
        // If we are currently resizing a column, block normal cell clicks
        if (this.isResizing) return;

        const rect = this.container.getBoundingClientRect();
        const clickX = e.clientX - rect.left + this.scrollPane.scrollLeft;
        const clickY = e.clientY - rect.top + this.scrollPane.scrollTop;

        if (clickX < this.dimensions.ROW_HEADER_WIDTH || clickY < this.dimensions.COL_HEADER_HEIGHT) {
            this.commitInputChanges();
            return;
        }

        // Find Row target
        const targetRow = Math.floor((clickY - this.dimensions.COL_HEADER_HEIGHT) / this.dimensions.ROW_HEIGHT) + 1;

        // Find Column target by accumulating active widths dynamically
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

        this.commitInputChanges();
        this.selection.select(targetRow, targetCol);
        this.drawGrid();
        this.positionInputOverlay(targetRow, targetCol);
    }

    private positionInputOverlay(row: number, col: number): void {
        const colWidth = this.dimensions.getColWidth(col);
        const inputX = this.dimensions.getColXPosition(col) - this.scrollPane.scrollLeft;
        const inputY = this.dimensions.COL_HEADER_HEIGHT + (row - 1) * this.dimensions.ROW_HEIGHT - this.scrollPane.scrollTop;

        this.cellInput.style.left = `${inputX}px`;
        this.cellInput.style.top = `${inputY}px`;
        this.cellInput.style.width = `${colWidth + 1}px`;
        this.cellInput.style.height = `${this.dimensions.ROW_HEIGHT + 1}px`;

        this.cellInput.value = this.dimensions.getCellData(row, col);
        this.cellInput.style.display = 'block';
        this.cellInput.focus();
    }

    private ensureCellIsVisible(row: number, col: number): void {
        const colWidth = this.dimensions.getColWidth(col);
        const cellLeft = this.dimensions.getColXPosition(col);
        const cellTop = this.dimensions.COL_HEADER_HEIGHT + (row - 1) * this.dimensions.ROW_HEIGHT;

        let newScrollLeft = this.scrollPane.scrollLeft;
        let newScrollTop = this.scrollPane.scrollTop;

        if (cellLeft < this.scrollPane.scrollLeft + this.dimensions.ROW_HEADER_WIDTH) {
            newScrollLeft = cellLeft - this.dimensions.ROW_HEADER_WIDTH;
        } else if (cellLeft + colWidth > this.scrollPane.scrollLeft + this.viewportWidth) {
            newScrollLeft = cellLeft + colWidth - this.viewportWidth;
        }

        if (cellTop < this.scrollPane.scrollTop + this.dimensions.COL_HEADER_HEIGHT) {
            newScrollTop = cellTop - this.dimensions.COL_HEADER_HEIGHT;
        } else if (cellTop + this.dimensions.ROW_HEIGHT > this.scrollPane.scrollTop + this.viewportHeight) {
            newScrollTop = cellTop + this.dimensions.ROW_HEIGHT - this.viewportHeight;
        }

        if (newScrollLeft !== this.scrollPane.scrollLeft) this.scrollPane.scrollLeft = newScrollLeft;
        if (newScrollTop !== this.scrollPane.scrollTop) this.scrollPane.scrollTop = newScrollTop;
    }


    private commitInputChanges(): void {
        if (this.cellInput.style.display === 'block' && this.selection.activeRow !== null && this.selection.activeCol !== null) {
            this.dimensions.setCellData(this.selection.activeRow, this.selection.activeCol, this.cellInput.value);
            this.cellInput.style.display = 'none';
        }
    }


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
}
