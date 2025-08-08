#include <stdbool.h>
#include <emscripten.h>
#include <stdio.h>
#include <stdint.h>

// --- Simulation Settings ---
#define WIDTH 80
#define HEIGHT 60

uint8_t grid[HEIGHT][WIDTH] = {0}; // Start with a completely dead grid

EMSCRIPTEN_KEEPALIVE int get_width() { return WIDTH; }
EMSCRIPTEN_KEEPALIVE int get_height() { return HEIGHT; }
EMSCRIPTEN_KEEPALIVE void *get_grid_pointer() { return grid; }

// --- Game Logic  ---
int count_live_neighbors(int y, int x)
{
    int count = 0;
    for (int dy = -1; dy <= 1; dy++)
    {
        for (int dx = -1; dx <= 1; dx++)
        {
            if (dy == 0 && dx == 0)
                continue;
            int ny = (y + dy + HEIGHT) % HEIGHT;
            int nx = (x + dx + WIDTH) % WIDTH;
            count += grid[ny][nx];
        }
    }
    return count;
}

EMSCRIPTEN_KEEPALIVE void compute_next_generation()
{
    uint8_t next_grid[HEIGHT][WIDTH];
    for (int y = 0; y < HEIGHT; y++)
    {
        for (int x = 0; x < WIDTH; x++)
        {
            int live_neighbors = count_live_neighbors(y, x);
            if (grid[y][x] == 1)
            {
                next_grid[y][x] = (live_neighbors == 2 || live_neighbors == 3);
            }
            else
            {
                next_grid[y][x] = (live_neighbors == 3);
            }
        }
    }
    for (int y = 0; y < HEIGHT; y++)
    {
        for (int x = 0; x < WIDTH; x++)
        {
            grid[y][x] = next_grid[y][x];
        }
    }
}

EMSCRIPTEN_KEEPALIVE void clear_grid()
{
    for (int y = 0; y < HEIGHT; y++)
    {
        for (int x = 0; x < WIDTH; x++)
        {
            grid[y][x] = 0;
        }
    }
}

EMSCRIPTEN_KEEPALIVE void toggle_cell(int x, int y)
{
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT)
    {
        printf("Toggling cell at (%d, %d)\n", x, y);
        grid[y][x] = !grid[y][x];
    }
}