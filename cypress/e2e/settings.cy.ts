describe("Settings & How to play", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/game?seed=42")
    cy.clearAllLocalStorage()
    cy.reload()
    cy.get("#startGame").click()
  })

  it("opens settings, toggles persist across a reload", () => {
    cy.get("#openSettings").click()
    cy.get("[data-cy='settingsScreen']").should("be.visible")

    cy.get("#soundToggle")
      .should("have.attr", "aria-checked", "true")
      .click()
      .should("have.attr", "aria-checked", "false")

    // music defaults off — it's a taste thing
    cy.get("#musicToggle")
      .should("have.attr", "aria-checked", "false")
      .click()
      .should("have.attr", "aria-checked", "true")

    cy.get("#crtToggle").click()
    // the CRT toggle stamps a data attribute on <html>
    cy.document()
      .its("documentElement.dataset.crt")
      .should("eq", "off")

    cy.get("#settingsClose").click()
    cy.get("[data-cy='settingsScreen']").should("not.exist")

    cy.reload()
    cy.get("#openSettings").click()
    cy.get("#soundToggle").should("have.attr", "aria-checked", "false")
    cy.get("#musicToggle").should("have.attr", "aria-checked", "true")
    cy.get("#crtToggle").should("have.attr", "aria-checked", "false")
    cy.document()
      .its("documentElement.dataset.crt")
      .should("eq", "off")
  })

  it("reset high scores clears stored records", () => {
    cy.window().then((win) => {
      win.localStorage.setItem("highScore", "12345")
      win.localStorage.setItem("highScoreEasy", "999")
    })
    cy.get("#openSettings").click()
    cy.get("#resetScores").click()
    cy.contains("High scores cleared").should("be.visible")
    cy.window().then((win) => {
      expect(win.localStorage.getItem("highScore")).to.be.null
      expect(win.localStorage.getItem("highScoreEasy")).to.be.null
    })
  })

  it("opens and closes how to play", () => {
    cy.get("#openHowToPlay").click()
    cy.get("[data-cy='howToPlayScreen']").should("be.visible")
    cy.contains("cash minus debt").should("be.visible")
    cy.get("#howToPlayClose").click()
    cy.get("[data-cy='howToPlayScreen']").should("not.exist")
  })
})
