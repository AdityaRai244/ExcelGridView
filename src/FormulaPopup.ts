import type { CellEditor } from "./CellEditor.js";
import type { ExcelGrid } from "./ExcelGrid.js";
import { Formulas } from "./Formulas.js";

export class FormulaPopup {


    constructor(private divEle: HTMLDivElement, private grid: ExcelGrid) {
        this.initEventListeners();
    }

    private initEventListeners(): void {
        this.divEle.addEventListener('click', (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            if (target && target.classList.contains('formula-btn')) {
                const rawValue = target.getAttribute('data-value');
                if (rawValue !== null) {
                    const selectedFormula = rawValue as Formulas;
                    this.handleFormulaClick(selectedFormula);
                }
            }
        });
    }

    public show(x: number, y: number, width: number, height: number, value: string): void {
        this.divEle.style.left = `${x}px`;
        this.divEle.style.top = `${y + height}px`;
        this.divEle.style.width = `${2.5 * width + 1}px`;
        this.divEle.style.height = `${6 * height + 1}px`;

        this.divEle.innerHTML = `
           <div class="formulaDiv">
            ${Object.values(Formulas).map((val) => {
            return `<p class="formula-btn" data-value="${val}">${val}</p>`;
        }).join('')}
           </div>
        `;

        this.divEle.style.display = 'block';
        this.divEle.focus();
    }

    private handleFormulaClick(formula: Formulas): void {
        this.grid.editor.setValue(formula,true);
        this.hide();
    }

    public hide(): void {
        this.divEle.style.display = 'none';
    }
}
