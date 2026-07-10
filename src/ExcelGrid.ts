import { SelectionManager } from "./SelectionManager.js";
import { GridDimensions } from "./GridDimensions.js";
import { DataStore } from "./DataStore.js";
import { GridRenderer } from "./GridRenderer.js";
import { CellEditor } from "./CellEditor.js";
import { InteractionHandler } from "./InteractionHandler.js";
import { seedSpreadsheetData } from "./seed.js";
import { FormulaPopup } from "./FormulaPopup.js";
import { FormulaHandler } from "./FormulaHandler.js";
import { RowResizeController } from "./controllers/RowResizeController.js";
import { ColResizeController } from "./controllers/ColResizeController.js";
import { InputController } from "./controllers/InputController.js";
import { CellController } from "./controllers/CellController.js";
import { MouseEventsController } from "./controllers/MouseEventsController.js";
import { ScrollController } from "./controllers/ScrollController.js";
import { CommandManager } from "./command/CommandManager.js";
import { SummaryController } from "./controllers/SummaryController.js";

export class ExcelGrid {


    public selection = new SelectionManager();
    public dimensions = new GridDimensions();
    public dataStore = new DataStore();

    public commandController = new CommandManager(this);

    public container = document.getElementById('gridContainer') as HTMLDivElement;
    public canvas = document.getElementById('gridCanvas') as HTMLCanvasElement;
    public ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    public scrollPane = document.getElementById('scrollPane') as HTMLDivElement;
    public scrollContent = document.getElementById('scrollContent') as HTMLDivElement;
    public cellInput = document.getElementById('cellInput') as HTMLInputElement;
    public popup = document.getElementById('popup') as HTMLDivElement;
    public summaryBar = document.getElementById('summary-bar') as HTMLDivElement;
    

    public viewportWidth = 0;
    public viewportHeight = 0;

    public renderer: GridRenderer;
    public editor: CellEditor;
    public interaction: InteractionHandler;
    public formulaPopup : FormulaPopup
    public formulaHandler : FormulaHandler
    public rowResizeController : RowResizeController;
    public colResizeController : ColResizeController;
    public inputController : InputController;
    public cellController : CellController;
    public mouseEventsController : MouseEventsController
    public scrollController : ScrollController
    public summaryController : SummaryController

    constructor() {

        this.renderer = new GridRenderer(this);
        this.editor = new CellEditor(this.cellInput);
        this.formulaPopup = new FormulaPopup(this.popup,this);
        this.formulaHandler = new FormulaHandler(this);
        this.rowResizeController = new RowResizeController(this);
        this.colResizeController = new ColResizeController(this);
        this.inputController = new InputController(this);
        this.interaction = new InteractionHandler(this);
        this.cellController = new CellController(this);
        this.mouseEventsController = new MouseEventsController(this);
        this.scrollController = new ScrollController(this);
        this.summaryController = new SummaryController(this.summaryBar,this);

        this.init();
        seedSpreadsheetData(this.dataStore,this);
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