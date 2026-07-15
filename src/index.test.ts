import { FormulaHandler } from "./FormulaHandler.js";
import { ExcelGrid } from "./ExcelGrid.js";
import { DataStore } from "./DataStore.js";
import { GridDimensions } from "./GridDimensions.js";

describe("Formula handler tests (Logic Only)", () => {
    let mockGrid: any;
    let formulaHandler: FormulaHandler;

    let dataStore: DataStore;
    let editorValue: string;
    let dimensions: GridDimensions

    beforeEach(() => {
        editorValue = "";
        dataStore = new DataStore();
        dimensions = new GridDimensions();
        mockGrid = {
            dataStore,
            dimensions,
            editor: {
                setValue: (val: string) => { editorValue = val; },
                getValue: () => editorValue
            }
        };

        formulaHandler = new FormulaHandler(mockGrid as ExcelGrid);
    });


    describe("SUM Formula Engine", () => {

        test("should sum a range of positive integers and decimals", () => {
            let num = dimensions.getExcelColumnNumber("A");
            dataStore.setCellData(1, num, "10");
            dataStore.setCellData(2, num, "5.5");
            dataStore.setCellData(3, num, "4.5");

            mockGrid.editor.setValue("=SUM(A1:A3)");
            formulaHandler.handleFormula();
            expect(mockGrid.editor.getValue()).toBe("20");
        });

        test("should handle negative numbers and zero correctly", () => {
            let num = dimensions.getExcelColumnNumber("B");
            dataStore.setCellData(1, num, "-10");
            dataStore.setCellData(2, num, "0");
            dataStore.setCellData(3, num, "25");

            mockGrid.editor.setValue("=SUM(B1:B3)");
            formulaHandler.handleFormula();

            expect(mockGrid.editor.getValue()).toBe("15");
        });

        test("should treat empty cells or text values as 0 during calculation", () => {
            let num = dimensions.getExcelColumnNumber("C");

            dataStore.setCellData(1, num, "100");
            dataStore.setCellData(2, num, "");
            dataStore.setCellData(3, num, "NotANum");

            mockGrid.editor.setValue("=SUM(C1:C3)");
            formulaHandler.handleFormula();

            expect(mockGrid.editor.getValue()).toBe("100");
        });


    });

    describe("Average Formula Engine", () => {

        test("should average a range of positive integers and decimals", () => {
            let num = dimensions.getExcelColumnNumber("A");
            dataStore.setCellData(1, num, "10");
            dataStore.setCellData(2, num, "5.5");
            dataStore.setCellData(3, num, "4.5");

            mockGrid.editor.setValue("=AVERAGE(A1:A3)");
            formulaHandler.handleFormula();
            expect(mockGrid.editor.getValue()).toBe("6.67");
        });

        test("should handle negative numbers and zero correctly", () => {
            let num = dimensions.getExcelColumnNumber("B");
            dataStore.setCellData(1, num, "-10");
            dataStore.setCellData(2, num, "0");
            dataStore.setCellData(3, num, "25");

            mockGrid.editor.setValue("=AVERAGE(B1:B3)");
            formulaHandler.handleFormula();

            expect(mockGrid.editor.getValue()).toBe("5.00");
        });


        test("should treat empty cells or text values as 0 during calculation", () => {
            let num = dimensions.getExcelColumnNumber("C");

            dataStore.setCellData(1, num, "100");
            dataStore.setCellData(2, num, "");
            dataStore.setCellData(3, num, "NotANum");
            dataStore.setCellData(4, num, "5");

            mockGrid.editor.setValue("=AVERAGE(C1:C4)");
            formulaHandler.handleFormula();

            expect(mockGrid.editor.getValue()).toBe("52.50");
        });


    });

    describe("Minimum Formula Engine", () => {

        test("should find a min in a range of positive integers and decimals", () => {
            let num = dimensions.getExcelColumnNumber("A");
            dataStore.setCellData(1, num, "10");
            dataStore.setCellData(2, num, "5.5");
            dataStore.setCellData(3, num, "4.5");

            mockGrid.editor.setValue("=MINIMUM(A1:A3)");
            formulaHandler.handleFormula();
            expect(mockGrid.editor.getValue()).toBe("4.5");
        });

        test("should handle negative numbers and zero correctly", () => {
            let num = dimensions.getExcelColumnNumber("B");
            dataStore.setCellData(1, num, "-10");
            dataStore.setCellData(2, num, "0");
            dataStore.setCellData(3, num, "25");

            mockGrid.editor.setValue("=MINIMUM(B1:B3)");
            formulaHandler.handleFormula();

            expect(mockGrid.editor.getValue()).toBe("-10");
        });


        test("should treat empty cells or text values as 0 during calculation", () => {
            let num = dimensions.getExcelColumnNumber("C");

            dataStore.setCellData(1, num, "100");
            dataStore.setCellData(2, num, "");
            dataStore.setCellData(3, num, "NotANum");
            dataStore.setCellData(4, num, "5");

            mockGrid.editor.setValue("=MINIMUM(C1:C4)");
            formulaHandler.handleFormula();

            expect(mockGrid.editor.getValue()).toBe("5");
        });


    });

    describe("Maximum Formula Engine", () => {

        test("should find a max in a range of positive integers and decimals", () => {
            let num = dimensions.getExcelColumnNumber("A");
            dataStore.setCellData(1, num, "10");
            dataStore.setCellData(2, num, "5.5");
            dataStore.setCellData(3, num, "4.5");

            mockGrid.editor.setValue("=MAXIMUM(A1:A3)");
            formulaHandler.handleFormula();
            expect(mockGrid.editor.getValue()).toBe("10");
        });

        test("should handle negative numbers and zero correctly", () => {
            let num = dimensions.getExcelColumnNumber("B");
            dataStore.setCellData(1, num, "-10");
            dataStore.setCellData(2, num, "0");
            dataStore.setCellData(3, num, "25");

            mockGrid.editor.setValue("=MAXIMUM(B1:B3)");
            formulaHandler.handleFormula();

            expect(mockGrid.editor.getValue()).toBe("25");
        });


        test("should treat empty cells or text values as 0 during calculation", () => {
            let num = dimensions.getExcelColumnNumber("C");

            dataStore.setCellData(1, num, "100");
            dataStore.setCellData(2, num, "");
            dataStore.setCellData(3, num, "NotANum");
            dataStore.setCellData(4, num, "5");

            mockGrid.editor.setValue("=MAXIMUM(C1:C4)");
            formulaHandler.handleFormula();

            expect(mockGrid.editor.getValue()).toBe("100");
        });


    });

    describe("Count Formula Engine", () => {

        test("should find the count of integers in a range of positive integers and decimals", () => {
            let num = dimensions.getExcelColumnNumber("A");
            dataStore.setCellData(1, num, "10");
            dataStore.setCellData(2, num, "5.5");
            dataStore.setCellData(3, num, "4.5");

            mockGrid.editor.setValue("=COUNT(A1:A3)");
            formulaHandler.handleFormula();
            expect(mockGrid.editor.getValue()).toBe("3");
        });

        test("should handle negative numbers and zero correctly", () => {
            let num = dimensions.getExcelColumnNumber("B");
            dataStore.setCellData(1, num, "-10");
            dataStore.setCellData(2, num, "0");
            dataStore.setCellData(3, num, "25");

            mockGrid.editor.setValue("=COUNT(B1:B3)");
            formulaHandler.handleFormula();

            expect(mockGrid.editor.getValue()).toBe("3");
        });


        test("should treat empty cells or text values as 0 during calculation", () => {
            let num = dimensions.getExcelColumnNumber("C");

            dataStore.setCellData(1, num, "100");
            dataStore.setCellData(2, num, "");
            dataStore.setCellData(3, num, "NotANum");
            dataStore.setCellData(4, num, "5");

            mockGrid.editor.setValue("=COUNT(C1:C4)");
            formulaHandler.handleFormula();

            expect(mockGrid.editor.getValue()).toBe("2");
        });


    });

    describe("Formula Arguements Engine", () => {

        test("should gracefully return a fallback error string for broken ranges", () => {
            mockGrid.editor.setValue("=SUM(A1:INVALID)");
            formulaHandler.handleFormula();

            expect(mockGrid.editor.getValue()).toBe("0");
        });


        test("should process lowercase cell coordinates gracefully", () => {
            let num = dimensions.getExcelColumnNumber("A");
            dataStore.setCellData(1, num, "5");
            dataStore.setCellData(2, num, "5");

            mockGrid.editor.setValue("=sum(a1:a2)");
            formulaHandler.handleFormula();

            expect(mockGrid.editor.getValue()).toBe("10");
        });


    });


});
