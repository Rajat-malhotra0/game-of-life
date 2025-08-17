// Ensure Module object exists
if (typeof Module === 'undefined') {
    var Module = {};
}

Module.onRuntimeInitialized = () => {
    console.log("Wasm module is ready!");

    const getWidth = Module._get_width;
    const getHeight = Module._get_height;
    const getGridPointer = Module._get_grid_pointer;
    const computeNextGeneration = Module._compute_next_generation;
    const clearGrid = Module._clear_grid;
    const toggleCell = Module._toggle_cell;

    const canvas = document.getElementById("game-canvas");
    const startButton = document.getElementById("start-button");
    const clearButton = document.getElementById("clear-button");
    const speedSlider = document.getElementById("speed-slider");
    const speedValue = document.getElementById("speed-value");
    const themeSelector = document.getElementById("theme-selector");
    const ctx = canvas.getContext("2d");

    const themes = {
        dark: {
            cellColor: "#add8e6",
            gridColor: "#444",
            className: "dark"
        },
        light: {
            cellColor: "#2c3e50",
            gridColor: "#dce4ec",
            className: "light"
        },
        retro: {
            cellColor: "#33FF77",
            gridColor: "#2A553A",
            className: "retro"
        }
    };

    let currentTheme = themes.dark;

    const gridPointer = getGridPointer();
    const gridWidth = getWidth();
    const gridHeight = getHeight();

    const wasmGrid = new Uint8Array( // Taking the data of this from wasm memory and creating a view of it
        Module.HEAPU8.buffer,
        gridPointer,
        gridWidth * gridHeight
    );

    console.log(
        `Grid is ${gridWidth}x${gridHeight} and starts at memory address ${gridPointer}`
    );

    const CELL_SIZE = 10;
    canvas.width = gridWidth * CELL_SIZE;
    canvas.height = gridHeight * CELL_SIZE;

    let animationId = null;
    let currentSpeed = 10;

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw live cells
        ctx.fillStyle = currentTheme.cellColor;
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
        
        // Draw grid lines
        ctx.strokeStyle = currentTheme.gridColor;
        ctx.lineWidth = currentTheme.className === 'retro' ? 2 : 0.5;
        ctx.beginPath();
        
        // Vertical lines
        for (let x = 0; x <= gridWidth; x++) {
            ctx.moveTo(x * CELL_SIZE, 0);
            ctx.lineTo(x * CELL_SIZE, canvas.height);
        }
        
        // Horizontal lines
        for (let y = 0; y <= gridHeight; y++) {
            ctx.moveTo(0, y * CELL_SIZE);
            ctx.lineTo(canvas.width, y * CELL_SIZE);
        }
        
        ctx.stroke();
    }

    function applyTheme(themeName) {
        const newTheme = themes[themeName];
        if (!newTheme) return;

        currentTheme = newTheme;
        document.body.className = newTheme.className;
        drawGrid();
    }

    function renderLoop() {
        computeNextGeneration();
        drawGrid();
        animationId = setTimeout(renderLoop, 1000 / currentSpeed);
    }

    function handleInteraction(event) {
        if (animationId) return;
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const clientX = event.touches
            ? event.touches[0].clientX
            : event.clientX;
        const clientY = event.touches
            ? event.touches[0].clientY
            : event.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const gridX = Math.floor((x / rect.width) * gridWidth);
        const gridY = Math.floor((y / rect.height) * gridHeight);

        toggleCell(gridX, gridY);
        drawGrid();
    }

    startButton.addEventListener("click", () => {
        if (animationId) {
            clearTimeout(animationId);
            animationId = null;
            startButton.textContent = "Start";
        } else {
            renderLoop();
            startButton.textContent = "Stop";
        }
    });

    clearButton.addEventListener("click", () => {
        if (animationId) {
            clearTimeout(animationId);
            animationId = null;
            startButton.textContent = "Start";
        }
        clearGrid();
        drawGrid();
    });

    speedSlider.addEventListener("input", (e) => {
        currentSpeed = parseInt(e.target.value);
        speedValue.textContent = `${currentSpeed} FPS`;
    });

    canvas.addEventListener("click", handleInteraction);
    canvas.addEventListener("touchstart", handleInteraction);

    themeSelector.addEventListener("change", (e) => {
        applyTheme(e.target.value);
    });

    speedValue.textContent = `${currentSpeed} FPS`;
    applyTheme('dark'); // Set initial theme
};
