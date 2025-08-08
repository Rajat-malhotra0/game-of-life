# WebAssembly Game of Life

A classic implementation of Conway's Game of Life built with C and WebAssembly, rendered in the browser using the HTML Canvas. This project was created to demonstrate how a C-based application can be compiled for the web and made interactive and responsive.

## Live Demo 🚀

You can view the live, deployed version here:
**https://gameoflifews.netlify.app/**



## Features

* Core logic for calculating the game's state is written in C and compiled to WebAssembly for high performance.
* The game grid is rendered in the browser using the HTML5 Canvas API.
* Users can interactively place initial cells by clicking or tapping on the grid.
* Responsive design that works on both desktop and mobile browsers.
* Start, Stop, and Clear controls for managing the simulation.

## How to Run Locally

To run this project on your own machine, you will need the [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) installed and activated.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Rajat-malhotra0/game-of-life.git](https://github.com/Rajat-malhotra0/game-of-life.git)
    cd game-of-life
    ```

2.  **Compile the WebAssembly module:**
    ```bash
    emcc gol.c -o gol.js -s "EXPORTED_RUNTIME_METHODS=['HEAPU8']"
    ```

3.  **Start a local server:**
    This project requires a server to handle the `.wasm` file correctly. A simple Python server will work.
    ```bash
    python3 -m http.server
    ```

4.  **Open in browser:**
    Navigate to `http://localhost:8000` in your web browser.
