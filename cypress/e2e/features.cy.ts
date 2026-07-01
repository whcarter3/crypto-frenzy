describe("Testing main features and function", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/game")
  })

  it("sets initial state", () => {
    cy.get("#advDay").should("be.visible")
    cy.get("[data-cy='cash']").should("have.text", "$2,000")
    cy.get("[data-cy='debt']").should("have.text", "$2,000")
    cy.get("[data-cy='days left']").should("have.text", "30")
    cy.get("#payDebt").should("be.disabled")
    cy.get("#expandWallet").should("be.disabled")
  })

  it("advances day", () => {
    cy.get("#advDay").click()
    cy.get("[data-cy='days left']").should("have.text", "29")
    cy.get("[data-cy='assetPrice']").first().should("not.have.text", "$0")
  })

  it("buys and sells an asset", () => {
    cy.get("#advDay").click()
    cy.get("[data-cy='solanaBuyButton']").click()
    cy.get("[data-cy='solanaAssetWallet']")
      .invoke("text")
      .then(parseInt)
      .should("be.gt", 0)
    cy.get("[data-cy='solanaSellButton']").click()
    cy.get("[data-cy='solanaAssetWallet']")
      .invoke("text")
      .then(parseInt)
      .should("eq", 0)
  })

  it("resets and starts a new game", () => {
    cy.get("#advDay").click()
    cy.get("#runInfo").click()
    cy.get("[data-cy='cash']").should("have.text", "$2,000")
    cy.get("ul").should("contain", "Click Advance Day to start.")
  })
})
