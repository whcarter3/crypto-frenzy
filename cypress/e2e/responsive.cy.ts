// Guards the layout at a true phone viewport. Manual preview checks in
// the dev environment can't render below ~518px CSS width, so this
// Cypress viewport test is the only thing that actually exercises real
// phone widths — it caught a genuine ~600px min-content overflow
// (flex min-width:auto + a stray mx-auto) that manual checks missed.
const noHorizontalOverflow = (label: string) =>
  cy.document().should((doc) => {
    expect(
      doc.documentElement.scrollWidth,
      `${label}: page scrollWidth vs viewport`,
    ).to.be.at.most(doc.defaultView!.innerWidth + 1)
  })

// clearAllLocalStorage is a no-op before the origin's first visit, so
// visit first, clear, then reload for a genuinely fresh start.
const freshVisit = () => {
  cy.visit("http://localhost:3000/game?seed=42")
  cy.clearAllLocalStorage()
  cy.reload()
}

describe("Responsive layout", () => {
  it("mobile (375px): no horizontal overflow through the core flow", () => {
    cy.viewport(375, 812)
    freshVisit()
    noHorizontalOverflow("difficulty modal")
    // force: toasts/overlays can cover buttons at narrow widths;
    // actionability is not what this spec is testing
    cy.get("#startGame").click({ force: true })
    noHorizontalOverflow("run started")
    cy.get("#advDay").click({ force: true })
    noHorizontalOverflow("day advanced")
    cy.get("[data-cy='solanaBuyButton']").click({ force: true })
    cy.get("[data-cy='solanaAssetWallet']")
      .invoke("text")
      .then(parseInt)
      .should("be.gt", 0)
    noHorizontalOverflow("holding visible")
    cy.get("[data-cy='solanaSellButton']").click({ force: true })
    noHorizontalOverflow("after sell")
  })

  it("desktop (1280px): sidebar and trade area sit side by side, no overflow", () => {
    cy.viewport(1280, 900)
    freshVisit()
    cy.get("#startGame").click({ force: true })
    noHorizontalOverflow("desktop in-game")
    cy.get("aside").then(($aside) => {
      const asideRight = $aside[0].getBoundingClientRect().right
      cy.get("[data-cy='assetActions']")
        .first()
        .then(($action) => {
          expect(
            $action[0].getBoundingClientRect().left,
          ).to.be.at.least(asideRight)
        })
    })
  })
})
