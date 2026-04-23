# Feature Backlog: Digital Block Print Studio

This document serves as a tracking place for experimental and advanced tools to build into the magic/advanced side of the digital block print studio when we're ready.

## The Problem: "Empty Space"
Our traditional grid weaves limit how tightly things can lock together. We want to afford more creative control to handle negative space gracefully without losing the "magic" auto-tiling feel.

## Proposed Future Features:

### 1. The Density Slider
- **Goal:** Give users total freedom over how tightly packed the pattern is.
- **Implementation:** Add a slider range `[0.5x ... 1.5x]`.
- **Mechanics:** 
  - `0.5x` forces overlapping tiles (heavy, intricate textile).
  - `1.0x` is the standard current grid match.
  - `1.5x` creates an airy, sparse scattering effect.
  - '2.0x' something like that which is even sparse.

### 2. The Layered Paint Sandbox
- **Goal:** Remove the "auto-clear" on print, allowing users to build complex textiles using multiple blocks just like real printing.
- **Mechanics:**
  - Introduce a "Preserve Canvas" toggle or turn off the background clears when repeatedly printing.
  - Users can lay down a background "scatter" in faint colors, pick a different motif, and drop a "Saree border" on top.
  - Note: Need to figure out the UX so it is not confusing or doesn't feel like the app is breaking if things don't clear.

### 3. "Choose Your Squares" (Custom Layout Masking)
- **Goal:** Let the user explicitly toggle squares or columns on the fabric where patterns *shouldn't* appear.
- **Mechanics:**
  - An interactive preview of the grid where the user can click specific nodes to toggle them off. 
  - E.g., clicking out a central diamond so the pattern only prints in the corners.


Also, magic mode opens only certain patterns/layouts, when in Magic modes, can it show all the patterns/layouts?




