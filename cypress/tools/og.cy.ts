// Tool spec, not a test: renders og-source.html at exactly 1200×630
// and screenshots it — the output becomes public/og.png. Uses
// Cypress's own file server (no baseUrl configured), NOT the game
// server: `serve -s` clean-urls + SPA fallback rewrite standalone
// .html pages into the app, which is how the first cut of this card
// accidentally shipped a screenshot of the landing page.
// Excluded from the normal e2e run (lives outside the specPattern);
// invoke explicitly:
//   npx cypress run --config specPattern=cypress/tools/og.cy.ts
//   sips -z 630 1200 cypress/screenshots/og.cy.ts/og.png
//   cp cypress/screenshots/og.cy.ts/og.png public/og.png
describe("OG card generator", () => {
  it("captures the social card", () => {
    cy.viewport(1200, 630)
    cy.visit("cypress/tools/og-source.html")
    // fonts load async; the glow title is the last thing to settle
    cy.document().its("fonts.status").should("eq", "loaded")
    cy.screenshot("og", {
      capture: "viewport",
      overwrite: true,
    })
  })
})
