# Excel Grid
 
## Objective
The objective of this project is to build a high-performance, Excel-like spreadsheet application using TypeScript and HTML5 Canvas. The application demonstrates advanced software architecture by rendering a virtualized grid capable of supporting 100,000 rows and 500 columns, managing state through the Command Pattern, and strictly adhering to Object-Oriented Programming (OOP) and SOLID design principles.
 
## How to Install and Run
1. Clone or download the repository the repository and navigate to the root directory:
    ```bash
    git clone https://github.com/AdityaRai244/ExcelGridView
    cd .\Excel-Grid\
    ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate the dataset by running the data generation script: (This will generate a data.json file containing 50,000 records)
    ```bash
    node seed.js
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Open `index.html` in a browser or serve the project using a local dev server. (you can run the server via `npm run dev`)
 
## Features Implemented
- Virtual Rendering: Canvas only draws the cells currently visible in the viewport, supporting massive datasets without lag.
- Sticky row and column headers
- Cell Editing: Double-click any cell to edit its contents via a dynamic HTML input overlay.
- Formula Support: Basic formula parsing (e.g., =SUM(A1:B3)) with a suggestion popup.
- Row & Column Resizing: Click and drag header boundaries to resize rows and columns.
- Selection & Navigation: Support for cell highlighting and keyboard navigation (Arrow keys, Enter, Escape).
- Summary Calculations: Calculation of Count, Min, Max, Sum, and Average for numeric data in the selected range.
- Undo / Redo: Ctrl+Z and Ctrl+Y shortcuts for editing and resizing actions.
 
 
## How OOP Concepts are Applied
- Encapsulation: Internal state is hidden and protected. For example: `DataStore` manages a private `Map` of cells.
- Abstraction: Complex logic is hidden behind simple APIs. The `ExcelGrid` class does not know how canvas pixel math works; it simply calls `dimensions.getTotalGridHeight()`.
- Polymorphism: Command classes implement a shared `ICommand` interface. The `CommandManager` treats all actions as a generic `ICommand`. It can execute or undo an `EditCommand` or a `ColumnResizeCommand` using the exact same method calls, without knowing the specific details of the action.
 
## How SOLID Principles are Applied
- Single Responsibility: Every class is designed with a single purpose. `GridRenderer` is only for drawing on the canvas.
- Open/Closed: The system is open for extension but closed for modification. Behavior can be extended by adding new command types without changing existing class logic.
- Liskov Substitution: Commands implementing `Command` can be used interchangeably by `CommandManager`.
- Interface Segregation: Small interfaces like `Command` keep behavior narrow and specific.`ICommand` has only `execute()` and `undo()`, ensuring implementing classes are not forced to write unnecessary methods
- Dependency Inversion: Higher-level classes depend on abstractions and injections rather than concrete instantiations. The `ExcelGrid` class receives its major dependencies (such as `DataStore` and `CommandManager`) via constructor injection, allowing for modularity, easier testing, and clear contracts.
 
## How Virtual Rendering Works
Rendering 100,000 rows x 500 columns would freeze the browser if processed via the DOM. Instead, this project uses a Virtual Render loop:
1. The GridRenderer calculates exactly which rows and columns should be visible based on the current scrollX, scrollY, and canvas dimensions.
2. It skips processing any elements outside these bounds.
3. The GridRenderer then only loops through and paints the explicitly visible subset of cells onto the single <canvas> element.
 
## How Data is Generated and Loaded
Data generation is handled by a script (seed.ts) which generates 50,000 randomized employee records (ID, Name, Age, Salary) and writes them to a JSON file.
At runtime, index.ts delegates the loading to JsonDataLoader, which fetches the JSON asynchronously, parses it, and maps it directly into the DataStore's sparse matrix map.
 
## How the Command Pattern (Undo/Redo) Works
Every user action that modifies state (editing a cell, resizing a row/column) is wrapped in a class that implements ICommand which has execute() and undo() methods.
When an action occurs, it is passed to the CommandManager, which executes it and pushes it to an undoStack. When Ctrl+Z is pressed, the manager pops the command, calls its undo() method, and pushes it to a redoStack.
 
## Test Cases Covered
Unit tests for all the formulas ( SUM,COUNT,MIN,MAX,Avg )
- Should handle range of positive integers and decimals
- Should handle negative numbers and zero correctly 
- Should treat empty cells or text values as 0 during calculation
For formula arguements
- Should gracefully return a fallback error string for broken ranges
- Should process lowercase cell coordinates gracefully

## Performance Observations
* Initialization: Loading and parsing 50,000 records takes roughly ~100-200ms depending on the hardware.
* Scrolling: Because only visible cells (typically ~30-50 at a time) are painted, scrolling remains locked at 60 FPS regardless of the total data volume.
* Calculations: Highlighting massive ranges (e.g., 10,000 cells) for summary calculation performs adequately but can cause slight frame drops due to iterating the Map structure.
 
## Accessibility Considerations
Because HTML5 <canvas> renders as a single bitmap image, its internal elements are inherently invisible to screen readers. To mitigate this limitation:
* Focus management and typing are offloaded to an actual HTML <input> element overlay, making the active editing state accessible.
* The Summary status bar utilizes real HTML text elements outside the canvas, ensuring that computed data can be read by assistive technology.
* Keyboard navigation is implemented to allow usage without a mouse.
 
## Known Limitations and Next Improvements
- Copy/Paste functionality is not implemented yet
- No built-in support for custom cell formatting, or merging cells.
- Formulas are limited to a small set of functions(SUM,COUNT,MIN,MAX,Avg) and do not support arbitrary expressions.
- Selection Scrolling, Dragging the mouse outside the canvas bounds does not currently auto-scroll the viewport to extend the selection.
- Not using persistent storage
- Multiline values not supported in cells