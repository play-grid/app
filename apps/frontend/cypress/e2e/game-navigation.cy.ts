describe('Game Navigation', () => {
  beforeEach(() => {
    cy.visit('/en/');
  });

  describe('Game Navigation', () => {
    beforeEach(() => {
      cy.visit('/en/');
    });

    it('should switch language from EN to AR and back', () => {
    // Switch to Arabic
      cy.get('[data-testid="site-customizations-button"]').click();
      cy.get('[data-testid="language-toggle-trigger"]').click({ waitForAnimations: false });
      cy.get('div[role="option"]').contains('العربية').click();
      cy.get('[data-testid="save-customizations-button"]').click();

      // Wait for navigation to Arabic
      cy.location('pathname', { timeout: 6000 }).should('include', '/ar');
      cy.get('[data-testid="card-game-play"]', { timeout: 6000 }).should('be.visible');

      // Switch back to English
      cy.get('[data-testid="site-customizations-button"]').click();
      cy.get('[data-testid="language-toggle-trigger"]').click({ waitForAnimations: false });
      cy.get('div[role="option"]').contains('English').click();
      cy.get('[data-testid="save-customizations-button"]').click();

      // Wait for navigation back to English
      cy.location('pathname', { timeout: 6000 }).should('include', '/en');
      cy.get('[data-testid="card-game-play"]', { timeout: 6000 }).should('be.visible');
    });
  });

  it('should navigate to correct path with language and gameId', () => {
    cy.visit('/en');
    cy.contains('Play Now').click({ force: true });
    cy.location('pathname', { timeout: 6000 })
      .should('match', /\/en\/guess-logo(\/[\w-]+)?/);
  });
});
