import type { ICommand } from "./ICommand.js";
import type { ExcelGrid } from "../ExcelGrid.js";

export class EditCellCommand implements ICommand{

    private oldValue : string;
    
    constructor(
        private grid : ExcelGrid,
        private row: number,
        private col : number,
        private newValue : string
    ){
        this.oldValue = this.grid.dataStore.getCellData(row,col) || "";
    }

    public execute() : void{

        this.grid.dataStore.setCellData(this.row,this.col,this.newValue);

    }

    public undo() : void{
        this.grid.dataStore.setCellData(this.row,this.col,this.oldValue);
    }


}