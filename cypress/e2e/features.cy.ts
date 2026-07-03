describe("Testing main features and function", () => {
  beforeEach(() => {
    // ?seed pins the run's RNG so prices are deterministic — without it,
    // a day-2 moonshot can price Solana above starting cash and disable
    // the buy controls these tests click (~2% flake)
    cy.visit("http://localhost:3000/game?seed=42")
    // a fresh run boots into the difficulty modal — start on Normal
    cy.get("#startGame").click()
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

  it("buys and sells a specific quantity", () => {
    cy.get("#advDay").click()
    cy.get("[data-cy='solanaAmountInput']").type("2")
    cy.get("[data-cy='solanaBuyButton']").click()
    cy.get("[data-cy='solanaAssetWallet']").should("have.text", "2")
    cy.get("[data-cy='solanaSellInput']").type("1")
    cy.get("[data-cy='solanaSellButton']").click()
    cy.get("[data-cy='solanaAssetWallet']").should("have.text", "1")
  })

  it("fills the max affordable with the Max button", () => {
    cy.get("#advDay").click()
    cy.get("[data-cy='solanaMaxButton']").click()
    cy.get("[data-cy='solanaAmountInput']")
      .invoke("val")
      .then((val) => {
        expect(parseInt(String(val))).to.be.gt(0)
        cy.get("[data-cy='solanaBuyButton']").click()
        cy.get("[data-cy='solanaAssetWallet']").should(
          "have.text",
          String(val)
        )
      })
  })

  it("resets and starts a new game", () => {
    cy.get("#advDay").click()
    cy.get("#runInfo").click()
    // resetting brings the difficulty modal back
    cy.get("#startGame").click()
    cy.get("[data-cy='cash']").should("have.text", "$2,000")
    cy.get("ul").should("contain", "Click Advance Day to start.")
  })

  it("starts an easy mode run with its own settings", () => {
    cy.get("#runInfo").click()
    cy.get("#easyMode").click()
    cy.get("#startGame").click()
    cy.get("[data-cy='cash']").should("have.text", "$1,500")
    cy.get("[data-cy='days left']").should("have.text", "59")
  })

  it("restores a run after a reload", () => {
    cy.get("#advDay").click()
    cy.get("[data-cy='solanaBuyButton']").click()
    cy.get("[data-cy='days left']").should("have.text", "29")
    cy.reload()
    cy.get("[data-cy='days left']").should("have.text", "29")
    cy.get("[data-cy='solanaAssetWallet']")
      .invoke("text")
      .then(parseInt)
      .should("be.gt", 0)
    cy.get("#startGame").should("not.exist")
  })

  it("offers resume or new run from the landing page", () => {
    cy.get("#advDay").click()
    cy.get("[data-cy='days left']").should("have.text", "29")
    cy.visit("http://localhost:3000/")
    cy.get("#resumeRun").should("be.visible")
    cy.get("#newRun").click()
    // a new run starts fresh at the difficulty modal
    cy.get("#startGame").should("be.visible")
  })

  it("ends the run with a game-over screen", () => {
    for (let i = 0; i < 29; i++) {
      cy.get("#advDay").click()
    }
    // the last-day warning pops over the action bar — wait for it to close
    cy.contains("Last day!").should("be.visible")
    cy.contains("Last day!", { timeout: 6000 }).should("not.exist")
    cy.get("#advDay").click()
    cy.get("[data-cy='gameOverScreen']").should("be.visible")
    cy.get("[data-cy='finalScore']").should("contain", "$")
    cy.get("#playAgain").click()
    cy.get("#startGame").should("be.visible")
  })
})
