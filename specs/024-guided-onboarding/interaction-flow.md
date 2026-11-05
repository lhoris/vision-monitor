# Interactive Video Addition Flow

The live dashboard onboarding tour guides the user through adding the first video without changing data automatically.

1. Highlight an empty grid cell and ask the user to click it.
2. The user's click opens the existing video-add modal.
3. Wait for the modal's available video-source list to render.
4. Highlight an available source and ask the user to select it.
5. The existing grid placement flow adds the selected video.
6. Continue with the remaining live dashboard guidance.

The tour uses Driver.js `advanceOnClick` for user-driven steps and `waitForElement` for the dynamically rendered source list. If the grid has no empty cell or no available source, the unavailable step is skipped instead of creating demo data.
