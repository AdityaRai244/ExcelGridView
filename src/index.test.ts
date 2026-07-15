import { FormulaHandler } from "./FormulaHandler.js";
import { ExcelGrid } from "./ExcelGrid.js";

describe("Formula handler tests (Logic Only)", () => {
    let mockGrid: any;
    let formulaHandler: FormulaHandler;

    let virtualCells: Record<string, string>;
    let editorValue: string;

    beforeEach(() => {
        virtualCells = {};
        editorValue = "";

        mockGrid = {
            dataStore: {
                setCellData: (row: number, col: number, val: string) => {
                    virtualCells[`${row},${col}`] = val;
                },
                getCellData: (row: number, col: number) => {
                    return virtualCells[`${row},${col}`] || "";
                }
            },
            editor: {
                setValue: (val: string) => { editorValue = val; },
                getValue: () => editorValue
            }
        };

        formulaHandler = new FormulaHandler(mockGrid as ExcelGrid);
    });

    function setMockCell(row: number, colStr: string, value: string) {
        const colNum = colStr.toUpperCase().charCodeAt(0) - 64;
        mockGrid.dataStore.setCellData(row, colNum, value);
    }

    describe("SUM Formula Engine", () => {

        test("should sum a range of positive integers and decimals", () => {
            setMockCell(1, "A", "10");
            setMockCell(2, "A", "5.5");
            setMockCell(3, "A", "4.5");

            mockGrid.editor.setValue("=SUM(A1:A3)");
            formulaHandler.handleFormula(true);

            expect(mockGrid.editor.getValue()).toBe("20");
        });

        test("should handle negative numbers and zero correctly", () => {
            setMockCell(1, "B", "-10");
            setMockCell(2, "B", "0");
            setMockCell(3, "B", "25");

            mockGrid.editor.setValue("=SUM(B1:B3)");
            formulaHandler.handleFormula(true);

            expect(mockGrid.editor.getValue()).toBe("15");
        });

        test("should process lowercase cell coordinates gracefully", () => {
            setMockCell(1, "A", "5");
            setMockCell(2, "A", "5");

            mockGrid.editor.setValue("=sum(a1:a2)");
            formulaHandler.handleFormula(true);

            expect(mockGrid.editor.getValue()).toBe("10");
        });

        test("should treat empty cells or text values as 0 during calculation", () => {
            setMockCell(1, "C", "100");
            setMockCell(2, "C", "");        
            setMockCell(3, "C", "NotANum"); 

            mockGrid.editor.setValue("=SUM(C1:C3)");
            formulaHandler.handleFormula(true);

            expect(mockGrid.editor.getValue()).toBe("100");
        });

        test("should gracefully return a fallback error string for broken ranges", () => {
            mockGrid.editor.setValue("=SUM(A1:INVALID)");
            formulaHandler.handleFormula(true);

            expect(mockGrid.editor.getValue()).toBe("0");
        });


    });

    
});
