import type { ExcelGrid } from "./ExcelGrid.js";

export class InteractionHandler {


    constructor(private grid: ExcelGrid) {
    }

    public bindEvents(): void {
        this.grid.scrollPane.addEventListener('scroll', () => this.grid.scrollController.handleScroll());
        this.grid.scrollPane.addEventListener('click', (e) => this.grid.mouseEventsController.handleMouseClick(e));
        this.grid.scrollPane.addEventListener('pointerdown', (e) => this.grid.mouseEventsController.handleMouseDown(e));
        this.grid.scrollPane.addEventListener('pointermove', (e) => this.grid.mouseEventsController.handleMouseMove(e));
        window.addEventListener('pointerup', (e) => this.grid.mouseEventsController.handleMouseUp(e));
        window.addEventListener('keyup', (e) => this.grid.inputController.startEditing(e));
        this.grid.cellInput.addEventListener('keyup', (e) => this.grid.inputController.handleInputKeyUp(e));
        window.addEventListener('keydown', (e) => this.grid.cellController.moveSelectedCell(e));
    }

}