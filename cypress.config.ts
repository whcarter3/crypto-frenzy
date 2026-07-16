import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, _config) {
      on("task", {
        // cy.log() doesn't reach the terminal in headless runs — this
        // is how axe violation details surface in CI output.
        log(message: string) {
          console.log(message);
          return null;
        },
      });
    },
  },
});
