import { SelectionManager } from "./SelectionManager.js";
import { GridDimensions } from "./GridDimensions.js";
import { DataStore } from "./DataStore.js";
import { GridRenderer } from "./GridRenderer.js";
import { CellEditor } from "./CellEditor.js";
import { InteractionHandler } from "./InteractionHandler.js";
import { seedSpreadsheetData } from "./seed.js";
import { FormulaPopup } from "./FormulaPopup.js";
import { FormulaHandler } from "./FormulaHandler.js";

export class ExcelGrid {


    public selection = new SelectionManager();
    public dimensions = new GridDimensions();
    public dataStore = new DataStore();

    public container = document.getElementById('gridContainer') as HTMLDivElement;
    public canvas = document.getElementById('gridCanvas') as HTMLCanvasElement;
    public ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    public scrollPane = document.getElementById('scrollPane') as HTMLDivElement;
    public scrollContent = document.getElementById('scrollContent') as HTMLDivElement;
    public cellInput = document.getElementById('cellInput') as HTMLInputElement;
    public popup = document.getElementById('popup') as HTMLDivElement;

    public viewportWidth = 0;
    public viewportHeight = 0;

    public renderer: GridRenderer;
    public editor: CellEditor;
    private interaction: InteractionHandler;
    public formulaPopup : FormulaPopup
    public formulaHandler : FormulaHandler

    constructor() {

        this.renderer = new GridRenderer(this.canvas);
        this.editor = new CellEditor(this.cellInput);
        this.interaction = new InteractionHandler(this);
        this.formulaPopup = new FormulaPopup(this.popup,this.editor);
        this.formulaHandler = new FormulaHandler(this.editor,this.dimensions,this.dataStore);

        this.init();
        seedSpreadsheetData(this.dataStore);
        this.drawGrid();
    }

    private init(): void {
        this.interaction.bindEvents();
        this.resizeCanvas();
    }

    public drawGrid(): void {
        this.renderer.drawGrid(
            this.dimensions,
            this.dataStore,
            this.selection,
            this.scrollPane.scrollLeft,
            this.scrollPane.scrollTop
        )
    }

    public resizeCanvas(): void {
        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight;
        const totalWidth = this.dimensions.getTotalGridWidth();
        const totalHeight = this.dimensions.getTotalGridHeight();

        this.renderer.resizeCanvas(
            containerWidth,
            containerHeight,
            totalWidth,
            totalHeight,
            this.scrollContent
        );

        this.drawGrid();
    }
}