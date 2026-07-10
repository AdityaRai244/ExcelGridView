import type { ExcelGrid } from "./ExcelGrid.js";

export class InteractionHandler {


    constructor(private grid: ExcelGrid) {
    }

    public bindEvents(): void {
        this.grid.scrollPane.addEventListener('scroll', () => this.grid.scrollController.handleScroll());
        this.grid.scrollPane.addEventListener('click', (e) => this.grid.mouseEventsController.handleMouseClick(e));
        this.grid.scrollPane.addEventListener('mousedown', (e) => this.grid.mouseEventsController.handleMouseDown(e));
        this.grid.scrollPane.addEventListener('mousemove', (e) => this.grid.mouseEventsController.handleMouseMove(e));
        window.addEventListener('mouseup', (e) => this.grid.mouseEventsController.handleMouseUp(e));
        this.grid.cellInput.addEventListener('keyup', (e) => this.grid.inputController.handleInputKeyUp(e));
        window.addEventListener('keydown', (e) => this.grid.cellController.moveSelectedCell(e));
    }


}