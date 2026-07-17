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

  it("buys max and sells all via the stepper's fill buttons", () => {
    cy.get("#advDay").click()
    cy.get("[data-cy='solanaMaxButton']").click()
    cy.get("[data-cy='solanaBuyButton']").click()
    cy.get("[data-cy='solanaAssetWallet']")
      .invoke("text")
      .then(parseInt)
      .should("be.gt", 1)
    cy.get("[data-cy='solanaSellMaxButton']").click()
    cy.get("[data-cy='solanaSellButton']").click()
    cy.get("[data-cy='solanaAssetWallet']")
      .invoke("text")
      .then(parseInt)
      .should("eq", 0)
  })

  it("buys and sells specific quantities via typing and steppers", () => {
    cy.get("#advDay").click()
    // stepper defaults to 1; typed values replace it
    cy.get("[data-cy='solanaAmountInput']").clear().type("2")
    cy.get("[data-cy='solanaBuyButton']").click()
    cy.get("[data-cy='solanaAssetWallet']").should("have.text", "2")
    // sell stepper defaults to 1
    cy.get("[data-cy='solanaSellButton']").click()
    cy.get("[data-cy='solanaAssetWallet']").should("have.text", "1")
  })

  it("clamps typed amounts and disables the action at zero", () => {
    cy.get("#advDay").click()
    // absurd amount normalizes down to the max affordable on blur
    // (trigger focusout: React maps onBlur to focusout, which
    // Cypress's .blur() does not dispatch)
    cy.get("[data-cy='solanaAmountInput']")
      .clear()
      .type("99999")
      .trigger("focusout")
    cy.get("[data-cy='solanaAmountInput']")
      .invoke("val")
      .then((val) => {
        const clamped = parseInt(String(val))
        expect(clamped).to.be.greaterThan(0)
        expect(clamped).to.be.lessThan(99999)
      })
    // zero disables the buy action
    cy.get("[data-cy='solanaZero']").click()
    cy.get("[data-cy='solanaBuyButton']").should("be.disabled")
    // plus re-enables
    cy.get("[data-cy='solanaPlus']").click()
    cy.get("[data-cy='solanaBuyButton']").should("not.be.disabled")
  })

  it("opens day 1 with a live market and shows day-over-day deltas", () => {
    // no advance needed: prices exist the moment the run starts
    cy.get("[data-cy='assetPrice']").first().should("not.have.text", "$0")
    cy.get("[data-cy='solanaBuyButton']").should("not.be.disabled")
    // deltas appear once there is a yesterday to compare against
    cy.get("[data-cy='bitcoinDayDelta']").should("not.exist")
    cy.get("#advDay").click()
    cy.get("[data-cy='bitcoinDayDelta']").should("be.visible")
  })

  it("starts a deterministic run from a seed typed into the modal", () => {
    // fresh visit without the ?seed param — must not resume the
    // autosave from beforeEach
    cy.clearAllLocalStorage()
    cy.visit("http://localhost:3000/game")
    cy.get("[data-cy='seedInput']").type("42")
    cy.get("#startGame").click()
    // seed 42 always opens with this exact day-1 market
    cy.get("[data-cy='assetPrice']").eq(3).should("have.text", "$53")
    cy.get("#advDay").click()
    // contain, not equal: the cell now carries the day-over-day delta too
    cy.get("[data-cy='assetPrice']").eq(3).should("contain.text", "$55")
    cy.get("[data-cy='seedDisplay']").should("contain", "42")
  })

  it("a seed link takes priority over resuming an unrelated save", () => {
    // beforeEach already started a seed=42 run and left it mid-day-1;
    // revisiting a *different* seed link must not silently resume it
    cy.visit("http://localhost:3000/game?seed=7")
    cy.get("#startGame").should("be.visible")
    cy.get("[data-cy='seedInput']").should("have.value", "7")
    cy.get("#startGame").click()
    // seed 7 always opens with this exact day-1 market
    cy.get("[data-cy='assetPrice']").eq(3).should("have.text", "$86")
  })

  it("resets and starts a new game (with tap-again confirm)", () => {
    cy.get("#advDay").click()
    // first tap arms the confirm, second tap resets
    cy.get("#runInfo").click()
    cy.get("#runInfo").should("contain", "TAP AGAIN")
    cy.get("#runInfo").click()
    // resetting brings the difficulty modal back
    cy.get("#startGame").click()
    cy.get("[data-cy='cash']").should("have.text", "$2,000")
    cy.get("ul").should("contain", "Market open")
  })

  it("starts an easy mode run with its own settings", () => {
    cy.get("#runInfo").click()
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
