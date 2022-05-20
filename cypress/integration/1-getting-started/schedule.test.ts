/// <reference types="cypress" />

describe('schedule', () => {
  beforeEach(() => {
    cy.visit('punch.php');
  });

  it('displays two todo items by default', () => {
    cy.get("input[id='compKeyboard']").type(Cypress.env('COMPANY_ID'));
    cy.get("input[id='nameKeyboard']").type(Cypress.env('USERNAME'));
    cy.get("input[id='pwKeyboard']").type(Cypress.env('PASSWORD'));
    cy.get("input[name='B1']").click();
    cy.get('a').contains('Update punch data').click();

    cy.get("tr[class='tr']")
      .find('td:contains(Missing In/Out)')
      .each(($row) => {
        const hours = $row.parent().children().eq(3);
        const onClickAttribute = $row.parent().attr('onclick');

        const url = onClickAttribute.substring(onClickAttribute.indexOf("('") + 2).slice(0, 65);

        cy.visit(url);
        cy.get('input[name=ehh0]').type('09');
        cy.get('input[name=emm0]').type('00');

        const [hoursNeeded, minutesNeeded] = hours.text().split(':');

        const hoursNumber = Number(hoursNeeded);
        const minutesNumber = Number(minutesNeeded);

        cy.get('input[name=xhh0]').type(String(9 + hoursNumber));
        cy.get('input[name=xmm0]').type(minutesNumber.toString());

        const button = cy.get("input[name='B1']");

        button.click();
      });
  });
});
