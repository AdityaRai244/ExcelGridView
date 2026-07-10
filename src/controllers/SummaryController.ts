import type { ExcelGrid } from "../ExcelGrid.js";

export class SummaryController {

    constructor(private divEle: HTMLDivElement, private grid: ExcelGrid) { }

    public calculateSummary(args: string) {
        const sum = this.grid.formulaHandler.handleSum(args);
        const avg = this.grid.formulaHandler.handleAverage(args);
        const count = this.grid.formulaHandler.handleCount(args);

        this.divEle.innerHTML = `
            <p class="summary-val"> Sum : ${sum}</p>   
            <p class="summary-val"> Average : ${avg}</p>   
            <p class="summary-val"> Count : ${count}</p>   
        `;

    }


}