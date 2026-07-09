import type { ExcelGrid } from "../ExcelGrid.js";

export class ScrollController {

    constructor(private grid: ExcelGrid) { }
    
    public handleScroll(): void {
        // if a cell is being edited (input box is visible) and the user scrolls down change the coordinates
        //  of input box to keep it glued to its original cell position.
        if (
            this.grid.editor.isEditing() &&
            this.grid.selection.activeRow != null &&
            this.grid.selection.activeCol != null
        ) {
            this.grid.inputController.positionInputOverlay(this.grid.selection.activeRow, this.grid.selection.activeCol);
        }
        requestAnimationFrame(() => this.grid.drawGrid());
    }


}