import type { ExcelGrid } from "./ExcelGrid.js";
import { Formulas } from "./Formulas.js";

export class FormulaHandler {

    private grid: ExcelGrid;

    constructor(
        grid: ExcelGrid
    ) {
        this.grid = grid;
    }

    public handleFormula() {
        const formulaHandlers: Record<Formulas, (args: string) => any> = {
            [Formulas.Sum]: (args) => this.handleSum(args),
            [Formulas.Min]: (args) => this.handleMin(args),
            [Formulas.Max]: (args) => this.handleMax(args),
            [Formulas.Average]: (args) => this.handleAverage(args),
            [Formulas.Count]: (args) => this.handleCount(args),
        };

        let value = this.grid.editor.getValue();
        if (!value) return;

        const match = value.match(/^=([A-Za-z_]+)\((.*)\)/);
        if (match) {
            const rawName = match[1]?.toUpperCase();
            const formulaArgs = match[2];

            const extractedName = Object.values(Formulas).find(
                (val) => val.toUpperCase() === rawName
            ) as Formulas;

            const handler = formulaHandlers[extractedName];

            if (handler) {
                const result = handler(formulaArgs ?? "");
                this.grid.editor.setValue(result);
            } else {
                console.error("Formula not supported.");
            }
        }
    }


    private matchFormat(args: string) {
        const match = args.match(/^([A-Za-z0-9]+):([A-Za-z0-9]+)$/);
        if (!match) return null;

        const from = match[1];
        const to = match[2];
        if (!from || !to) return null;

        const cellRegex = /^([A-Za-z]+)([0-9]+)$/;
        const fromMatch = from.match(cellRegex);
        const toMatch = to.match(cellRegex);

        if (!fromMatch || !toMatch) return null;

        const fromColLabel = fromMatch[1];
        const fromRowStr = fromMatch[2];
        const toColLabel = toMatch[1];
        const toRowStr = toMatch[2];

        if (!fromColLabel || !fromRowStr || !toColLabel || !toRowStr) {
            return null;
        }

        const fromRow = parseInt(fromRowStr, 10);
        const toRow = parseInt(toRowStr, 10);

        const fromColNumber = this.grid.dimensions.getExcelColumnNumber(fromColLabel);

        return { fromRow, toRow, fromColNumber };
    }

    private handleSum(args: string) {

        const format = this.matchFormat(args);
        if (format === null) return;
        const fromRow = format.fromRow;
        const toRow = format.toRow;
        const fromColNumber = format.fromColNumber;


        let sum = 0;
        console.log(fromRow, toRow);
        for (let i = fromRow; i <= toRow; i++) {

            sum += parseInt(this.grid.dataStore.getCellData(i, fromColNumber));
        }

        return sum.toString();
    }

    private handleMin(args: string) {
        const format = this.matchFormat(args);
        if (format === null) return;
        const fromRow = format.fromRow;
        const toRow = format.toRow;
        const fromColNumber = format.fromColNumber;

        let min = Number.MAX_VALUE;
        console.log(fromRow, toRow);
        for (let i = fromRow; i <= toRow; i++) {

            min = Math.min(min, parseInt(this.grid.dataStore.getCellData(i, fromColNumber)));
        }


        return min.toString();
    }

    private handleMax(args: string) {
        const format = this.matchFormat(args);
        if (format === null) return;
        const fromRow = format.fromRow;
        const toRow = format.toRow;
        const fromColNumber = format.fromColNumber;

        let max = Number.MIN_VALUE;
        console.log(fromRow, toRow);
        for (let i = fromRow; i <= toRow; i++) {

            max = Math.max(max, parseInt(this.grid.dataStore.getCellData(i, fromColNumber)));
        }


        return max.toString();
    }
    private handleAverage(args: string) {
        const match = args.match(/^([A-Za-z0-9]+):([A-Za-z0-9]+)$/);
        if (!match) return "Handling sum logic";

        const from = match[1];
        const to = match[2];
        if (!from || !to) return "Handling sum logic";

        const cellRegex = /^([A-Za-z]+)([0-9]+)$/;
        const fromMatch = from.match(cellRegex);
        const toMatch = to.match(cellRegex);

        if (!fromMatch || !toMatch) return "Handling sum logic";

        const fromColLabel = fromMatch[1];
        const fromRowStr = fromMatch[2];
        const toColLabel = toMatch[1];
        const toRowStr = toMatch[2];

        if (!fromColLabel || !fromRowStr || !toColLabel || !toRowStr) {
            return "Handling sum logic";
        }

        const fromRow = parseInt(fromRowStr, 10);
        const toRow = parseInt(toRowStr, 10);

        const fromColNumber = this.grid.dimensions.getExcelColumnNumber(fromColLabel);
        const toColNumber = this.grid.dimensions.getExcelColumnNumber(toColLabel);

        let avg = 0;
        console.log(fromRow, toRow);
        for (let i = fromRow; i <= toRow; i++) {

            avg += parseInt(this.grid.dataStore.getCellData(i, fromColNumber));
        }
        console.log(avg);

        avg = avg / Math.abs((fromRow - toRow + 1));
        console.log(avg);

        return avg.toString();
    }

    private handleCount(args: string) {
        const format = this.matchFormat(args);
        if (format === null) return;
        const fromRow = format.fromRow;
        const toRow = format.toRow;
        const fromColNumber = format.fromColNumber;

        let count: number = 0;
        for (let i = fromRow; i <= toRow; i++) {
            const cellValue = this.grid.dataStore.getCellData(i, fromColNumber);
            if (cellValue !== null && cellValue.trim() !== '' && !isNaN(Number(cellValue))) {
                count++;
            }
        }


        return count.toString();
    }




}