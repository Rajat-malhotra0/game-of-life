// main.js

// Wait for the Wasm module to be ready
Module.onRuntimeInitialized = () => {
    console.log("Wasm module is ready!");

    // --- Get API functions from Wasm ---
    // We use the underscore syntax Emscripten creates
    const getWidth = Module._get_width;
    const getHeight = Module._get_height;
    const getGridPointer = Module._get_grid_pointer;
    const computeNextGeneration = Module._compute_next_generation;
    const clearGrid = Module._clear_grid;
    const toggleCell = Module._toggle_cell;

    const canvas = document.getElementById("game-canvas");
    const startButton = document.getElementById("start-button");
    const clearButton = document.getElementById("clear-button");
    const ctx = canvas.getContext("2d");

    // --- Setup Memory Bridge ---
    const gridPointer = getGridPointer();
    const gridWidth = getWidth();
    const gridHeight = getHeight();

    const wasmGrid = new Uint8Array(
        Module.HEAPU8.buffer,
        gridPointer,
        gridWidth * gridHeight
    );

    console.log(
        `Grid is ${gridWidth}x${gridHeight} and starts at memory address ${gridPointer}`
    );

    const CELL_SIZE = 10; // Size of each cell in pixels
    canvas.width = gridWidth * CELL_SIZE;
    canvas.height = gridHeight * CELL_SIZE;

    let animationId = null;

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#add8e6";
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const index = y * gridWidth + x;
                if (wasmGrid[index] === 1) {
                    ctx.fillRect(
                        x * CELL_SIZE,
                        y * CELL_SIZE,
                        CELL_SIZE,
                        CELL_SIZE
                    );
                }
            }
        }
    }

    function renderLoop() {
        computeNextGeneration();
        drawGrid();
        animationId = requestAnimationFrame(renderLoop);
    }

    function handleInteraction(event) {
        // Don't allow changing cells while the simulation is running
        if (animationId) return;

        // Prevent default behavior, like scrolling on touch
        event.preventDefault();

        const rect = canvas.getBoundingClientRect();

        // Check if it's a touch or mouse event to get coordinates
        const clientX = event.touches
            ? event.touches[0].clientX
            : event.clientX;
        const clientY = event.touches
            ? event.touches[0].clientY
            : event.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Convert pixel coordinates to grid coordinates and scale for canvas css resize
        const gridX = Math.floor((x / rect.width) * gridWidth);
        const gridY = Math.floor((y / rect.height) * gridHeight);

        toggleCell(gridX, gridY);
        drawGrid();
    }

    startButton.addEventListener("click", () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
            startButton.textContent = "Start";
        } else {
            renderLoop();
            startButton.textContent = "Stop";
        }
    });

    clearButton.addEventListener("click", () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
            startButton.textContent = "Start";
        }
        clearGrid();
        drawGrid();
    });

    canvas.addEventListener("click", handleInteraction);
    canvas.addEventListener("touchstart", handleInteraction);

    drawGrid(); // Initial draw
};
