# Remove Top Progress Indicator

## Goal

Remove the segmented progress indicator from the top-center header while retaining the current layer text and stage name.

## Design

- Delete the `stage-dots` element from `App` rather than hiding it with CSS.
- Remove the now-unused `.stage-dots` styles, including the mobile width rule.
- Keep the existing `stage-progress` container, visible `Layer {stage.layer}` text, stage name, and accessible `Stage X of Y` label unchanged.
- Do not change lesson navigation, replay state, or the case library.

## Verification

- Add or update the app render test to assert the layer and stage text remain present and the `stage-dots` markup is absent.
- Run the focused app test and the project test suite.

