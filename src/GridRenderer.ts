import type { DataStore } from "./DataStore.js";
import type { GridDimensions } from "./GridDimensions.js";
import type { SelectionManager } from "./SelectionManager.js";

export class GridRenderer {

    private ctx: CanvasRenderingContext2D;
    private viewportWidth: number = 0;
    private viewportHeight: number = 0;

    constructor(private canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    // Handles window resize ( responsiveness )
    public resizeCanvas(containerWidth: number, containerHeight: number, totalWidth: number, totalHeight: number, scrollContent: HTMLDivElement): void {

        this.viewportWidth = containerWidth;
        this.viewportHeight = containerHeight;

        // ensures that the content doesnt overstretch and does not come out to be blurred due to scaling.
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.viewportWidth * dpr;
        this.canvas.height = this.viewportHeight * dpr;
        this.canvas.style.width = `${this.viewportWidth}px`;
        this.canvas.style.height = `${this.viewportHeight}px`;
        this.ctx.scale(dpr, dpr);
        scrollContent.style.width = `${totalWidth}px`;
        scrollContent.style.height = `${totalHeight}px`;

    }

    // paints on the canvas 
    public drawGrid(
        dimensions: GridDimensions,
        dataStore: DataStore,
        selection: SelectionManager,
        scrollLeft: number,
        scrollTop: number
    ): void {

        this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

        // calculate which rows are visible ( row at top of the screen and bottom of the screen )
        const startRow = dimensions.getRowIndexAtY(scrollTop);
        const bottomY = scrollTop + this.viewportHeight;
        const endRow = dimensions.getRowIndexAtY(bottomY);

        this.ctx.font = "13px Arial";
        this.ctx.textBaseline = "middle";

        // iterate over the visible rows
        for (let r = startRow; r <= endRow; r++) {

            const rowHeight = dimensions.getRowHeight(r);
            const cellY = dimensions.getRowYPosition(r) - scrollTop;

            let cellX = dimensions.ROW_HEADER_WIDTH - scrollLeft;
            for (let c = 1; c <= dimensions.TOTAL_COLS; c++) {
                const colWidth = dimensions.getColWidth(c);

                // only draw the cell if it is inside the veiwport.
                if (cellX + colWidth >= dimensions.ROW_HEADER_WIDTH && cellX <= this.viewportWidth) {

                    // highlight cell if it is selected by user.
                    if (selection.isSelected(r, c)) {
                        this.ctx.fillStyle = '#e8f0fe';

                        //                x       y    width      height
                        this.ctx.fillRect(cellX, cellY, colWidth, rowHeight);
                    }

                    // draw the gray borders
                    this.ctx.strokeStyle = "#e0e0e0";
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(cellX, cellY, colWidth, rowHeight);

                    // draw text inside cell.
                    const val = dataStore.getCellData(r, c);
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
                // move x to the start of next column
                cellX += colWidth;
            }
        }

        // background color for cell headers.
        this.ctx.fillStyle = "#f1f3f4";
        this.ctx.fillRect(dimensions.ROW_HEADER_WIDTH, 0, this.viewportWidth, dimensions.COL_HEADER_HEIGHT);


        // col names
        let headerX = dimensions.ROW_HEADER_WIDTH - scrollLeft;
        for (let c = 1; c <= dimensions.TOTAL_COLS; c++) {
            const colWidth = dimensions.getColWidth(c);

            if (headerX + colWidth >= dimensions.ROW_HEADER_WIDTH && headerX <= this.viewportWidth) {
                const isCurrentCol = (selection.activeCol === c);

                // if col is active darken backround and turn text blue.
                this.ctx.fillStyle = isCurrentCol ? "#dadce0" : "#f1f3f4";
                this.ctx.fillRect(headerX, 0, colWidth, dimensions.COL_HEADER_HEIGHT);

                this.ctx.strokeStyle = "#bbb";
                this.ctx.strokeRect(headerX, 0, colWidth, dimensions.COL_HEADER_HEIGHT);
                this.ctx.fillStyle = isCurrentCol ? "#1a73e8" : "#666";
                this.ctx.textAlign = "center";
                this.ctx.fillText(dimensions.getExcelColumnLabel(c), headerX + (colWidth / 2), dimensions.COL_HEADER_HEIGHT / 2);
            }
            headerX += colWidth;
        }

        // background color for row headers.
        this.ctx.fillStyle = "#f1f3f4";
        this.ctx.fillRect(0, dimensions.COL_HEADER_HEIGHT, dimensions.ROW_HEADER_WIDTH, this.viewportHeight);


        // row numbers
        for (let r = startRow; r <= endRow; r++) {
            const rowHeight = dimensions.getRowHeight(r);
            const headerY = dimensions.getRowYPosition(r) - scrollTop;
            if (headerY + rowHeight < dimensions.COL_HEADER_HEIGHT) continue;

            const isCurrentRow = (selection.activeRow === r);

            // if row is active darken backround and turn text blue.
            this.ctx.fillStyle = isCurrentRow ? "#dadce0" : "#f1f3f4";
            this.ctx.fillRect(0, headerY, dimensions.ROW_HEADER_WIDTH, rowHeight);

            this.ctx.strokeStyle = "#ccc";
            this.ctx.strokeRect(0, headerY, dimensions.ROW_HEADER_WIDTH, rowHeight);
            this.ctx.fillStyle = isCurrentRow ? "#1a73e8" : "#666";
            this.ctx.textAlign = "center";
            this.ctx.fillText(r.toString(), dimensions.ROW_HEADER_WIDTH / 2, headerY + (rowHeight / 2));
        }

        // paint the empty square where row and col headers intersect.
        this.ctx.fillStyle = "#e8eaed";
        this.ctx.fillRect(0, 0, dimensions.ROW_HEADER_WIDTH, dimensions.COL_HEADER_HEIGHT);
        this.ctx.strokeStyle = "#bbb";
        this.ctx.strokeRect(0, 0, dimensions.ROW_HEADER_WIDTH, dimensions.COL_HEADER_HEIGHT);
    }

}