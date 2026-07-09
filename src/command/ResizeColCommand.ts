import type { ICommand } from "./ICommand.js";
import type { ExcelGrid } from "../ExcelGrid.js";

export class ResizeColCommand implements ICommand {


    constructor(
        private grid: ExcelGrid,
        private col: number,
        private oldWidth: number,
        private newWidth: number
    ) {
    }

    public execute(): void {

        this.grid.dimensions.setColWidth(this.col, this.newWidth);
        this.updateLayout();
    }

    public undo(): void {
        this.grid.dimensions.setColWidth(this.col, this.oldWidth);
        this.updateLayout();
    }

    private updateLayout(): void {
        this.grid.scrollContent.style.width = `${this.grid.dimensions.getTotalGridWidth()}px`;
        this.grid.drawGrid();
    }


}