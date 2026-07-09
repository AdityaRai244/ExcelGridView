import { EditCellCommand } from "./command/EditCellCommand.js";
import { Formulas } from "./Formulas.js";

export class CellEditor {
    constructor(private inputEle: HTMLInputElement) { }

    public isFormulaEntered: boolean = false;

    public show(x: number, y: number, width: number, height: number, value: string): void {
        this.inputEle.style.left = `${x}px`;
        this.inputEle.style.top = `${y}px`;
        this.inputEle.style.width = `${width + 1}px`;
        this.inputEle.style.height = `${height + 1}px`;

        this.inputEle.value = value;
        this.inputEle.style.display = 'block';
        this.inputEle.focus();
    }

    public hide(): void {
        this.inputEle.style.display = 'none';
    }

    public isEditing(): boolean {
        return this.inputEle.style.display === 'block';
    }

    public getValue(): string {
        return this.inputEle.value;
    }

    public setFormula(formula: Formulas) {
        this.inputEle.value = `=${formula}(`;
        this.isFormulaEntered = true;
        this.inputEle.focus();
    }

    public setValue(args: string) {
        this.inputEle.value = `${args}`;
        this.inputEle.focus();
    }
     public appendValue(args: string) {
        const finalValue = `${this.inputEle.value}${args})`
        this.inputEle.value = finalValue;
        this.inputEle.focus();
    }

}