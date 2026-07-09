import type { ICommand } from "./ICommand.js";
import type { ExcelGrid } from "../ExcelGrid.js";

export class ResizeRowCommand implements ICommand {


    constructor(
        private grid: ExcelGrid,
        private row: number,
        private oldHeight: number,
        private newHeight: number
    ) {
    }

    public execute(): void {

        this.grid.dimensions.setRowHeight(this.row, this.newHeight);
        this.updateLayout();
    }

    public undo(): void {
        this.grid.dimensions.setRowHeight(this.row, this.oldHeight);
        this.updateLayout();
    }

    private updateLayout(): void {
        this.grid.scrollContent.style.height = `${this.grid.dimensions.getTotalGridHeight()}px`;
        this.grid.drawGrid();
    }


}