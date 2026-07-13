import type { ExcelGrid } from "../ExcelGrid.js";

export class SummaryController {

    constructor(private divEle: HTMLDivElement, private grid: ExcelGrid) { }

    public calculateSummary(args: string) {
        console.log("hii")
        const sum = this.grid.formulaHandler.handleSum(args);
        const avg = this.grid.formulaHandler.handleAverage(args);
        const count = this.grid.formulaHandler.handleCount(args);
        console.log(args,sum,avg,count);
        if(sum === '0' && avg === '0' && count === '0'){
            this.resetSummary();
            return;
        }
        this.divEle.style.display=`flex`;
        this.divEle.innerHTML = `
            <p class="summary-val"> Sum : ${sum}</p>   
            <p class="summary-val"> Average : ${avg}</p>   
            <p class="summary-val"> Count : ${count}</p>   
        `;

    }

    public resetSummary(){
        this.divEle.style.display='none';
        this.divEle.innerHTML = ``;
    }


}