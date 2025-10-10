describe('Game Navigation', () => {
  beforeEach(() => {
    cy.visit('/en/guess-logo');
  });

  it('should switch language from EN to AR and back', () => {
    // Switch to Arabic
    cy.get('[data-testid="site-customizations-button"]').click();
    cy.get('[data-testid="language-toggle-trigger"]').click({ waitForAnimations: false });
    cy.get('div[role="option"]').contains('العربية').click();

    // make sheet-overlay ,data state close
    cy.get('[data-slot="sheet-overlay"]').click('topRight', { force: true });

    // Wait for navigation
    cy.location('pathname', { timeout: 6000 }).should('include', '/ar/guess-logo');
    cy.contains('ابدأ اللعبة').should('be.visible');

    // Switch back to English
    cy.get('[data-testid="site-customizations-button"]').click();
    cy.get('[data-testid="language-toggle-trigger"]').click({ waitForAnimations: false });
    cy.get('div[role="option"]').contains('English').click();

    // make sheet-overlay ,data state close
    cy.get('[data-slot="sheet-overlay"]').click('topRight', { force: true });
    // Wait for navigation
    cy.location('pathname', { timeout: 6000 }).should('include', '/en/guess-logo');
    cy.contains('Start Game').should('be.visible');
  });

  it('should navigate to correct path with language and gameId', () => {
    cy.visit('/en');

    // Start game
    cy.contains('Play Now').click();
  });
});
