import type { ExcelGrid } from "../ExcelGrid.js";
import type { ICommand } from "./ICommand.js";

export class CommandManager {

    private undoStack: ICommand[] = [];
    private redoStack: ICommand[] = [];

    constructor(private grid: ExcelGrid) { }

    public executeCommand(command: ICommand): void {

        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
        this.grid.drawGrid();

    }

    public undo(): void {
        const command = this.undoStack.pop();
        if(!command) return;

        command.undo();
        this.redoStack.push(command);
        this.grid.drawGrid();
    }

    public redo() : void{
        const command = this.redoStack.pop();
        if(!command) return;

        command.execute();
        this.undoStack.push(command);
        this.grid.drawGrid();
    }

}