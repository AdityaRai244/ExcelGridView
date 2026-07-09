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

    public show(x: number, y: number, width: number, height: number, formulas: string[], active: number = 0): void {

        if (formulas.length === 0) {
            this.hide();
            return;
        }
        this.divEle.style.left = `${x}px`;
        this.divEle.style.top = `${y + height}px`;
        this.divEle.style.width = `${2.5 * this.grid.dimensions.DEFAULT_COL_WIDTH + 1}px`;
        this.divEle.style.height = 'auto';
        this.divEle.innerHTML = `
           <div class="formulaDiv">
            ${formulas.map((val, idx) => {
            return `<p class="${`formula-btn ${idx === active ? `active` : ``}`}" data-value="${val}">${val}</p>`;
        }).join('')}
           </div>
        `;

        this.divEle.style.display = 'block';
        this.divEle.focus();
    }

    public handleFormulaClick(formula: Formulas): void {
        this.grid.editor.setFormula(formula);
        this.hide();
    }

    public hide(): void {
        this.divEle.style.display = 'none';
    }
}
