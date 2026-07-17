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

// The page not scrolling isn't enough: the market table wrapper is
// overflow-x-auto, so it can scroll *internally* without moving the
// page — the exact per-table sideways scrolling the modal rework was
// meant to eliminate. Assert the table truly fits its wrapper.
const noTableOverflow = (label: string) =>
  cy.get("[data-cy='marketTable']").should(($el) => {
    expect(
      $el[0].scrollWidth,
      `${label}: market table scrollWidth vs wrapper`,
    ).to.be.at.most($el[0].clientWidth + 1)
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
    // deltas are now rendered — the table's widest state
    noTableOverflow("day advanced")
    cy.get("[data-cy='solanaRow']").click({ force: true })
    noHorizontalOverflow("trade modal open")
    // buying closes the modal on its own
    cy.get("[data-cy='solanaBuyButton']").click({ force: true })
    // holding a coin adds the holding marker + avg price to the row
    noTableOverflow("holding a coin")
    noHorizontalOverflow("modal closed")
    // B3: market first on phones — the table sits above the net-worth
    // stat, and the duplicate holdings panel doesn't render at all
    cy.get("[data-cy='marketTable']").then(($table) => {
      cy.get("[data-cy='netWorth']").then(($net) => {
        expect(
          $table[0].getBoundingClientRect().top,
          "market table above portfolio stats",
        ).to.be.lessThan($net[0].getBoundingClientRect().top)
      })
    })
    cy.get("[data-cy='solanaHoldingRow']").should("not.be.visible")
  })

  it("desktop (1280px): drag dividers resize and persist via settings", () => {
    cy.viewport(1280, 900)
    freshVisit()
    cy.get("#startGame").click({ force: true })
    // keyboard resize: two ArrowDown presses = +32px on the log
    cy.get("[data-cy='logDivider']")
      .should("be.visible")
      .focus()
      .type("{downArrow}{downArrow}")
      .should("have.attr", "aria-valuenow", "352")
    cy.get("[data-cy='sidebarDivider']")
      .focus()
      .type("{rightArrow}")
      .should("have.attr", "aria-valuenow", "336")
    // sizes are device preferences: they survive a reload via settings
    cy.reload()
    cy.get("[data-cy='logDivider']").should(
      "have.attr",
      "aria-valuenow",
      "352",
    )
    cy.get("[data-cy='sidebarDivider']").should(
      "have.attr",
      "aria-valuenow",
      "336",
    )
  })

  it("desktop (1280px): sidebar and trade area sit side by side, no overflow", () => {
    cy.viewport(1280, 900)
    freshVisit()
    cy.get("#startGame").click({ force: true })
    noHorizontalOverflow("desktop in-game")
    cy.get("aside").then(($aside) => {
      const asideRight = $aside[0].getBoundingClientRect().right
      cy.get("[data-cy='marketTable']").then(($table) => {
        expect(
          $table[0].getBoundingClientRect().left,
        ).to.be.at.least(asideRight)
      })
    })
  })
})
