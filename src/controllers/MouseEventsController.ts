import type { ExcelGrid } from "../ExcelGrid.js";

export class MouseEventsController {

    constructor(private grid: ExcelGrid) { }

    public selectedCellsStartCol = 0;
    public selectedCellsStartRow = 0;
    public isDraggingSelection = false;

    // additional flags to distinguish click vs drag to select
    public justDragged = false;
    public preventNextClick = false;
    public colOriginalWidthBeforeDrag = 0;
    public rowOriginalHeightBeforeDrag = 0;

    public handleMouseDown(e: MouseEvent): void {
        const { mouseX, mouseY } = this.grid.cursorController.getCursorPosition(e);
        this.grid.rowResizeController.handleRowResize(e, mouseX, mouseY);
        this.grid.colResizeController.handleColResize(e, mouseX, mouseY);
        this.grid.cellController.cellSelect(mouseX, mouseY);
    }

    public handleMouseMove(e: MouseEvent): void {
        const { mouseX, mouseY } = this.grid.cursorController.getCursorPosition(e);
        this.grid.colResizeController.handleColResizeMove(e);
        this.grid.rowResizeController.handleRowResizeMove(e);
        this.grid.cellController.cellSelectMove(e, mouseX, mouseY);
        this.grid.cursorController.setCursor(e, mouseX, mouseY);
    }

    public handleMouseUp(e: MouseEvent): void {
        const { mouseX, mouseY } = this.grid.cursorController.getCursorPosition(e);
        this.grid.cellController.appendSelectedCells(mouseX, mouseY);
        this.grid.colResizeController.handleColResizeUp();
        this.grid.rowResizeController.handleRowResizeUp();
        this.resetEvents();
    }

    public handleMouseClick(e: MouseEvent): void {

        if (this.preventNextClick) {
            this.preventNextClick = false;
            return;
        }

        if (this.grid.colResizeController.isColResizing || this.grid.rowResizeController.isRowResizing) return;

        const { mouseX, mouseY } = this.grid.cursorController.getCursorPosition(e);
        this.grid.selectionController.selectRow(mouseX, mouseY);
        this.grid.selectionController.selectCol(mouseX, mouseY);
        this.grid.inputController.commitInputChanges();
        this.grid.summaryController.resetSummary();
        this.grid.selectionController.openOverlayEditor(mouseX, mouseY);
        this.grid.drawGrid();

    }

    public resetEvents() {
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

}