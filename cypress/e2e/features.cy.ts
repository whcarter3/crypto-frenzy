describe("Testing main features and function", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000")
    cy.get("#startGame").click()
  })
  it("sets initial state", () => {
    cy.get("#advDay").should("be.visible")
    cy.get("[data-cy='day']")
      .invoke("text")
      .should("to.match", /Day 0\/\d+/)
    cy.get("[data-cy='cash']")
      .invoke("text")
      .should("to.match", /Cash \$\d+/)
    cy.get("[data-cy='debt']")
      .invoke("text")
      .should("to.match", /Debt \$\d+/)
    cy.get("[data-cy='wallet']")
      .invoke("text")
      .should("to.match", /Wallet 0\/\d+/)
  })

  it("advances day", () => {
    cy.get("#advDay").click()
    cy.get("[data-cy='day']")
      .invoke("text")
      .should("to.match", /Day 1\/\d+/)
  })

  it("buys and sells an asset", () => {
    cy.get("#advDay").click()
    cy.get("[data-cy='solanaBuyButton']").click()
    cy.get("[data-cy='wallet']")
      .invoke("text")
      .should("to.match", /Wallet \d+\/\d+/)
    cy.get("[data-cy='solanaAssetWallet']")
      .invoke("text")
      .then(parseInt)
      .should("be.gt", 0)
    cy.get("[data-cy='solanaSellButton']").click()
    cy.get("[data-cy='wallet']")
      .invoke("text")
      .should("to.match", /Wallet 0\/\d+/)
    cy.get("[data-cy='solanaAssetWallet']")
      .invoke("text")
      .then(parseInt)
      .should("eq", 0)
  })

  it("resets and starts a new game", () => {
    cy.get("#advDay").click()
    cy.get("#newGame").click()
    cy.get("#startGame").should("be.visible")
  })

  it("can select game difficulty", () => {
    cy.get("#newGame").click()
    cy.get("#easyMode").click()
    cy.get("#difficultyMode").should("contain", "Choose your difficulty: Easy")
    cy.get("#normalMode").click()
    cy.get("#difficultyMode").should(
      "contain",
      "Choose your difficulty: Normal"
    )
    cy.get("#hardMode").click()
    cy.get("#difficultyMode").should("contain", "Choose your difficulty: Hard")
  })

  it("can pay debt and expand wallet", () => {
    cy.get("#newGame").click()
    cy.get("#testMode").click()
    cy.get("#startGame").click()
    cy.get("[data-cy='cash']")
      .invoke("text")
      .should("to.match", /Cash \$1,000,000/)
    cy.get("#advDay").click()
    cy.get("#payDebt").click()
    cy.get("[data-cy='debt']")
      .invoke("text")
      .should("to.match", /Debt \$0/)
    cy.get("#expandWallet").click()
    cy.get("[data-cy='wallet']")
      .invoke("text")
      .should("to.match", /Wallet 0\/200/)
  })
})
