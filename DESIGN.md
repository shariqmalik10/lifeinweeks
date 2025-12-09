# Life in Weeks - Design Documentation

## 1. Overview
**Life in Weeks** is a visual "Memento Mori" dashboard designed to create a sense of urgency about the finite nature of human life. It visualizes a 90-year lifespan in a dense, data-rich matrix, using specific geometric shapes and a stark color palette to highlight time lived versus time remaining.

## 2. Visual Identity

### Color Palette
*   **Background:** Zinc 950 (`#09090b`) - The Void.
*   **Text (Primary):** Zinc 200 (`#e4e4e7`).
*   **Accent (Urgency):** Red 600 (`#dc2626`) - Used for the "Past" (blood/spent life) and the "Current" moment.
*   **Future (Potential):** Hollow/Outline (`transparent` with `zinc-700` border) - Represents emptiness/unwritten time.

### Typography
*   **Headings:** `Playfair Display` (Serif) - Adds a gravitas and classic editorial feel.
*   **UI / Data:** `Inter` (Sans-serif) - Clean, legible interface text.
*   **Data Values:** `Monospace` - For tabular alignment of stats.

## 3. Visualization logic

The core of the application is the `GridView`, which changes significantly based on the selected Time Unit.

### 3.1. "Life in Years" (Macro View)
*   **Shape:** **Diamonds** (Rotated Squares).
*   **Structure:** **Decades**.
    *   The grid is organized into **9 Rows** (Decades: 0s, 10s, 20s... 80s).
    *   Each row has **10 Columns** (Years).
*   **Visual Effect:** A dense block of 90 diamonds.
*   **Status:**
    *   **Past:** Filled Red Diamond.
    *   **Future:** Hollow Diamond.

### 3.2. "Life in Months" (Mid View)
*   **Shape:** **Circles**.
*   **Structure:** **Years**.
    *   The grid is organized into **90 Rows** (Ages 0-90).
    *   Each row has **12 Columns** (Months Jan-Dec).
*   **Status:**
    *   **Past:** Filled Red Circle.
    *   **Future:** Hollow Circle.

### 3.3. "Life in Weeks" (Micro View)
*   **Shape:** **Squares**.
*   **Structure:** **Years**.
    *   The grid is organized into **90 Rows** (Ages 0-90).
    *   Each row has **52 Columns** (Weeks 1-52).
*   **Status:**
    *   **Past:** Filled Red Square.
    *   **Future:** Hollow Square.
    *   **Current:** Pulsing Red Square with Glow.

## 4. Layout Architecture (Single Viewport)

The application uses a fixed `100vh` dashboard layout to ensure the entire lifespan is visible without scrolling, creating an immediate visual impact.

### 4.1. Sidebar (Left - Fixed Width)
Contains controls and the "Life Currency" breakdown.
*   **Hero Stat:** Percentage of life lived (e.g., "34%").
*   **Insight:** A Gemini-powered, stoic reflection on mortality.
*   **Stats:** Breakdown of remaining Summers, Mondays, Meals, and Awake Hours.
*   **Controls:** Date of Birth Input and Unit Switcher (Years/Months/Weeks).

### 4.2. Main Stage (Right - Flex Grow)
Contains the visualization grid.
*   **Responsiveness:** The grid uses `flex-col` with `flex-1` rows. This ensures the grid automatically stretches or shrinks to fit the exact height of the user's screen.
*   **Margins:** Minimal padding to maximize the visual density of the "Life Matrix."

## 5. User Interaction
*   **Hover Effects:**
    *   Future nodes (hollow) darken slightly on hover.
    *   Past nodes (filled) are static.
    *   Current node pulses to draw attention.
*   **Tooltips:** Hovering over a specific node displays the exact context (e.g., "Age 24, Week 12").