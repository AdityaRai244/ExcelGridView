import { EditCellCommand } from "../command/EditCellCommand.js";
import type { ExcelGrid } from "../ExcelGrid.js";

export class InputController {
    constructor(private grid: ExcelGrid) { }

    public commitInputChanges(): void {
        const activeRow = this.grid.selection.activeRow;
        const activeCol = this.grid.selection.activeCol;

        if (this.grid.editor.isEditing() && activeRow !== null && activeCol !== null) {

            if (this.grid.editor.getValue().startsWith('=')) {
                this.grid.formulaHandler.handleFormula();
            } else {
                // this.grid.dataStore.setCellData(activeRow, activeCol, this.grid.editor.getValue());
                const command = new EditCellCommand(this.grid, activeRow, activeCol, this.grid.editor.getValue());
                this.grid.commandController.executeCommand(command);
                this.grid.editor.hide();
                this.grid.formulaPopup.hide();
            }

        }
    }

    public handleInputKeyUp(e: KeyboardEvent): void {

        if (e.key === 'Enter') {
            this.commitInputChanges();
            this.grid.scrollPane.focus();
            this.grid.drawGrid();
        } else if (e.key === 'Escape') {
            this.grid.editor.hide();
            this.grid.drawGrid();
        }
        else if (e.key === '=') {
            const value = this.grid.editor.getValue();
            if (value === '=' && (this.grid.selection.activeCol != null && this.grid.selection.activeRow != null)) {
                const inputX = this.grid.dimensions.getColXPosition(this.grid.selection.activeCol) - this.grid.scrollPane.scrollLeft;
                const inputY = this.grid.dimensions.getRowYPosition(this.grid.selection.activeRow) - this.grid.scrollPane.scrollTop;
                const colWidth = this.grid.dimensions.getColWidth(this.grid.selection.activeCol);
                const rowHeight = this.grid.dimensions.getRowHeight(this.grid.selection.activeRow);

                this.grid.formulaPopup.show(inputX, inputY, colWidth, rowHeight, "Asdfadfs");
            }
        }
    }

    public positionInputOverlay(row: number, col: number): void {
        const colWidth = this.grid.dimensions.getColWidth(col);
        const rowHeight = this.grid.dimensions.getRowHeight(row);
        const inputX = this.grid.dimensions.getColXPosition(col) - this.grid.scrollPane.scrollLeft;
        const inputY = this.grid.dimensions.getRowYPosition(row) - this.grid.scrollPane.scrollTop;
        const val = this.grid.dataStore.getCellData(row, col);
        this.grid.editor.show(inputX, inputY, colWidth, rowHeight, val);
    }

}