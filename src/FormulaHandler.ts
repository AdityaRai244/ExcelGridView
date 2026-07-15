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
        const formulaHandlers: Record<Formulas, (args: string) => string> = {
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

        let fromRow = parseInt(fromRowStr, 10);
        let toRow = parseInt(toRowStr, 10);

        if (fromRow > toRow) {
            const temp = fromRow;
            fromRow = toRow;
            toRow = temp;
        }

        let fromColNumber = this.grid.dimensions.getExcelColumnNumber(fromColLabel);
        let toColNumber = this.grid.dimensions.getExcelColumnNumber(toColLabel);

        if (fromColNumber > toColNumber) {
            const temp = fromColNumber;
            fromColNumber = toColNumber;
            toColNumber = temp;
        }

        return { fromRow, toRow, fromColNumber, toColNumber };
    }

    public handleSum(args: string) {

        const format = this.matchFormat(args);

        if (format === null) return "0";
        const fromRow = format.fromRow;
        const toRow = format.toRow;
        const fromColNumber = format.fromColNumber;
        const toColNumber = format.toColNumber;


        let sum = 0;
        for (let i = fromRow; i <= toRow; i++) {
            for (let j = fromColNumber; j <= toColNumber; j++) {

                const cellValue = this.grid.dataStore.getCellData(i, j);
                if (cellValue !== null && cellValue.trim() !== '') {
                    const numValue = Number(cellValue);

                    if (!isNaN(numValue)) {
                        sum += Number(cellValue);
                    }
                }


            }
        }

        return sum.toString();
    }

    public handleMin(args: string) {
        const format = this.matchFormat(args);

        if (format === null) return "0";
        const fromRow = format.fromRow;
        const toRow = format.toRow;
        const fromColNumber = format.fromColNumber;
        const toColNumber = format.toColNumber;

        let min = Number.MAX_VALUE;

        for (let i = fromRow; i <= toRow; i++) {
            for (let j = fromColNumber; j <= toColNumber; j++) {
                const cellValue = this.grid.dataStore.getCellData(i, j);
                if (cellValue !== null && cellValue.trim() !== '') {
                    const numValue = Number(cellValue);

                    if (!isNaN(numValue)) {
                        min = Math.min(min, numValue);
                    }
                }
            }
        }


        return min.toString();
    }

    public handleMax(args: string) {

        const format = this.matchFormat(args);

        if (format === null) return "0";
        const fromRow = format.fromRow;
        const toRow = format.toRow;
        const fromColNumber = format.fromColNumber;
        const toColNumber = format.toColNumber;

        let max = Number.MIN_VALUE;

        for (let i = fromRow; i <= toRow; i++) {
            for (let j = fromColNumber; j <= toColNumber; j++) {

                const cellValue = this.grid.dataStore.getCellData(i, j);

                if (cellValue !== null && cellValue.trim() !== '') {
                    const numValue = Number(cellValue);

                    if (!isNaN(numValue)) {
                        max = Math.max(max, numValue);
                    }
                }
            }
        }

        return max.toString();
    }

    public handleAverage(args: string) {

        const format = this.matchFormat(args);


        if (format === null) return "0";
        const fromRow = format.fromRow;
        const toRow = format.toRow;
        const fromColNumber = format.fromColNumber;
        const toColNumber = format.toColNumber;

        let sum = 0;
        let numericCount = 0;
        for (let i = fromRow; i <= toRow; i++) {
            for (let j = fromColNumber; j <= toColNumber; j++) {
                const cellValue = this.grid.dataStore.getCellData(i, j);
                if (cellValue !== null && cellValue.trim() !== '') {
                    const numValue = Number(cellValue);

                    if (!isNaN(numValue)) {
                        sum += numValue;
                        numericCount++;
                    }
                }
            }
        }
        if (numericCount === 0) return "0";
        const avg = (sum / numericCount).toFixed(2);
        return avg.toString();
    }


    public handleCount(args: string) {

        const format = this.matchFormat(args);



        if (format === null) return "0";
        const fromRow = format.fromRow;
        const toRow = format.toRow;
        const fromColNumber = format.fromColNumber;
        const toColNumber = format.toColNumber;

        let count: number = 0;
        for (let i = fromRow; i <= toRow; i++) {
            for (let j = fromColNumber; j <= toColNumber; j++) {
                const cellValue = this.grid.dataStore.getCellData(i, j);

                if (cellValue !== null && cellValue.trim() !== '') {
                    const numValue = Number(cellValue);

                    if (!isNaN(numValue)) {
                        count++;
                    }
                }
            }
        }


        return count.toString();
    }


}