# Guided Onboarding Interaction Flow

## Entry

1. The user selects the help icon.
2. The current route is resolved to a screen-specific tour.
3. If the route has no tour, the user sees a localized unsupported-screen notice.

## Live dashboard

1. Explain process tabs and detail-process tabs.
2. Explain the empty grid cell used to add a video.
3. If the user presses `Next` without clicking the empty cell, trigger the existing cell action and open the video-source dialog.
4. Explain the available video source.
5. If the user presses `Next` without selecting a source, select the first available source through the existing UI action.
6. Explain the video grid and placement.
7. On `Previous`, reopen the source dialog when an empty cell is available; otherwise keep the user on the current step.
8. Explain the video title-bar context-menu gesture.
9. A real title-bar right-click advances to the context-menu step. `Next` performs the same right-click automatically and waits for the menu to render.
10. Explain rename, player-area resize, and removal from the current detail tab.
11. Close the context menu when leaving that step.
12. Explain the grid-layout control.
13. `Next` opens the layout menu and waits for it to render before showing the menu step.
14. Explain layout presets and custom row/column selection.
15. Close the layout menu on `Previous` or completion.

The live tour does not include an alarm explanation step.

## Navigation

- `Next ›` and `‹ Previous` use Driver.js navigation callbacks.
- `ArrowRight` and `ArrowLeft` provide keyboard navigation.
- `Escape` closes the tour.
- Dynamic action listeners are cleaned up before registering a new step listener and when the tour stops.

## Safety

- Driver.js waits for dynamic source and menu elements before selecting them.
- The tour uses existing UI actions and does not call backend APIs.
- Route changes and tour completion remove overlays and event listeners.
