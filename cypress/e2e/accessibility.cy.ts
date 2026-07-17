// Automated WCAG scanning via axe-core, gating every future PR — not just
// a one-time manual pass. Checks the states a player actually sees: the
// landing page, the difficulty modal, mid-run (with a holding so the sell
// controls render), and the game-over screen.
const logViolations = (violations) => {
  violations.forEach((v) => {
    cy.task(
      "log",
      `\n${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s)`,
    )
    v.nodes.forEach((n) =>
      cy.task("log", `  → ${n.target.join(", ")} :: ${n.failureSummary}`),
    )
  })
}

describe("Accessibility (axe)", () => {
  it("landing page has no violations", () => {
    cy.visit("http://localhost:3000/")
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logViolations)
  })

  it("difficulty modal has no violations", () => {
    cy.visit("http://localhost:3000/game?seed=42")
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logViolations)
  })

  it("in-game screen (with a holding) has no violations", () => {
    cy.visit("http://localhost:3000/game?seed=42")
    cy.get("#startGame").click()
    cy.get("#advDay").click()
    cy.get("[data-cy='solanaRow']").click()
    cy.get("[data-cy='solanaBuyButton']").click()
    cy.get("#tradeModalClose").click()
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logViolations)
  })

  it("trade modal has no violations", () => {
    cy.visit("http://localhost:3000/game?seed=42")
    cy.get("#startGame").click()
    // buy first so the modal renders both its buy and sell sections
    cy.get("[data-cy='solanaRow']").click()
    cy.get("[data-cy='solanaBuyButton']").click()
    cy.get("[data-cy='tradeModal']").should("be.visible")
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logViolations)
  })

  it("game-over screen has no violations", () => {
    cy.visit("http://localhost:3000/game?seed=42")
    cy.get("#startGame").click()
    for (let i = 0; i < 29; i++) {
      cy.get("#advDay").click()
    }
    // the last-day toast covers the button until it clears
    cy.contains("Last day!").should("be.visible")
    cy.contains("Last day!", { timeout: 6000 }).should("not.exist")
    cy.get("#advDay").click()
    cy.get("[data-cy='gameOverScreen']").should("be.visible")
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logViolations)
  })

  it("mobile layout (with a holding) has no violations", () => {
    cy.viewport(375, 812)
    cy.visit("http://localhost:3000/game?seed=42")
    cy.get("#startGame").click({ force: true })
    cy.get("[data-cy='solanaRow']").click({ force: true })
    cy.get("[data-cy='solanaBuyButton']").click({ force: true })
    cy.get("#tradeModalClose").click({ force: true })
    cy.get("[data-cy='marketTable']").should("exist")
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logViolations)
  })

  it("settings modal has no violations", () => {
    cy.visit("http://localhost:3000/game?seed=42")
    cy.get("#startGame").click()
    cy.get("#openSettings").click()
    cy.get("[data-cy='settingsScreen']").should("be.visible")
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logViolations)
  })

  it("how-to-play modal has no violations", () => {
    cy.visit("http://localhost:3000/game?seed=42")
    cy.get("#startGame").click()
    cy.get("#openHowToPlay").click()
    cy.get("[data-cy='howToPlayScreen']").should("be.visible")
    cy.injectAxe()
    cy.checkA11y(undefined, undefined, logViolations)
  })
})
