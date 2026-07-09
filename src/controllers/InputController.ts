import { EditCellCommand } from "../command/EditCellCommand.js";
import type { ExcelGrid } from "../ExcelGrid.js";
import { Formulas } from "../Formulas.js";

export class InputController {
    constructor(private grid: ExcelGrid) { }

    private isPopupActive: boolean = false;
    private formulas: string[] = Object.values(Formulas);
    private activePopupIndex: number = 0;

    public commitInputChanges(): void {

        const activeRow = this.grid.selection.activeRow;
        const activeCol = this.grid.selection.activeCol;
        if (this.grid.editor.isEditing() && activeRow !== null && activeCol !== null) {
            if (this.grid.editor.getValue().startsWith('=')) {
                this.grid.formulaHandler.handleFormula();
                this.grid.dataStore.setCellData(activeRow,activeCol, this.grid.editor.getValue());

                this.grid.selection.deselectAll();
                this.grid.editor.hide();
                this.grid.drawGrid();


            } else {
                const command = new EditCellCommand(this.grid, activeRow, activeCol, this.grid.editor.getValue());
                this.grid.commandController.executeCommand(command);
                this.grid.editor.hide();
                this.grid.formulaPopup.hide();
            }

        }

    }

    public handleInputKeyUp(e: KeyboardEvent): void {

        if (this.grid.selection.activeCol === null || this.grid.selection.activeRow === null) return;

        const inputX = this.grid.dimensions.getColXPosition(this.grid.selection.activeCol) - this.grid.scrollPane.scrollLeft;
        const inputY = this.grid.dimensions.getRowYPosition(this.grid.selection.activeRow) - this.grid.scrollPane.scrollTop;
        const colWidth = this.grid.dimensions.getColWidth(this.grid.selection.activeCol);
        const rowHeight = this.grid.dimensions.getRowHeight(this.grid.selection.activeRow);
        const value = this.grid.editor.getValue();

        if (!value.startsWith('=')) {
            this.isPopupActive = false;
            this.grid.formulaPopup.hide();
        }

        if (this.isPopupActive) {
            const cleanSearchValue = value.slice(1).toUpperCase();
            const filtered = this.formulas.filter((item) =>
                item.includes(cleanSearchValue)
            );

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.activePopupIndex = (this.activePopupIndex + 1) % filtered.length;
                this.grid.formulaPopup.show(inputX, inputY, colWidth, rowHeight, filtered, this.activePopupIndex);
                return;
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.activePopupIndex = (this.activePopupIndex - 1 + filtered.length) % filtered.length;
                this.grid.formulaPopup.show(inputX, inputY, colWidth, rowHeight, filtered, this.activePopupIndex);
                return;
            }
            else if (e.key === 'Enter') {
                if (filtered.length > 0) {
                    e.preventDefault();

                    const selectedFormula = filtered[this.activePopupIndex];
                    if (!selectedFormula) return;
                    this.grid.formulaPopup.handleFormulaClick(selectedFormula as Formulas);

                    this.isPopupActive = false;
                    return;
                }
            }
            else {
                this.activePopupIndex = 0;
                this.grid.formulaPopup.show(inputX, inputY, colWidth, rowHeight, filtered, this.activePopupIndex);
            }
        }


        if (e.key === '=') {
            if (value === '=') {
                this.grid.formulaPopup.show(inputX, inputY, colWidth, rowHeight, this.formulas);
                this.isPopupActive = true;
            }
        } else if (e.key === 'Enter') {
            this.commitInputChanges();
            this.grid.scrollPane.focus();
            this.grid.drawGrid();
            this.isPopupActive = false;
        } else if (e.key === 'Escape') {
            this.grid.editor.hide();
            this.grid.formulaPopup.hide();
            this.grid.drawGrid();
            this.isPopupActive = false;

        }
    }

    public positionInputOverlay(row: number, col: number): void {
        const colWidth = this.grid.dimensions.getColWidth(col);
        const rowHeight = this.grid.dimensions.getRowHeight(row);
        const inputX = this.grid.dimensions.getColXPosition(col) - this.grid.scrollPane.scrollLeft;
        const inputY = this.grid.dimensions.getRowYPosition(row) - this.grid.scrollPane.scrollTop;
        const val = this.grid.dataStore.getCellData(row, col);
        this.grid.editor.show(inputX, inputY, colWidth, rowHeight, val);
        if (this.isPopupActive) {
            this.grid.formulaPopup.show(inputX, inputY, colWidth, rowHeight, this.formulas);
        }
    }

}