/// <reference types="cypress" />
/// <reference types="mocha" />

describe('Inicio de sesión en Salud Vital', () => {
  beforeEach(() => {
    interface InterceptReq {
      body: { email?: string; password?: string };
      reply: (res: { statusCode: number; body: unknown }) => void;
    }
  // Mock de Edge Function login (usar patrón glob para que coincida independientemente del host)
  cy.intercept('POST', '**/functions/v1/login', (req: InterceptReq) => {
      const { email, password } = req.body;
      if (email === 'juanperez@test.com' && password === '12345678') {
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            data: {
              user: {
                id: 'u_1',
                email,
                full_name: 'Juan Pérez',
                role: 'patient',
              },
              tokens: {
                access_token: 'fake-access',
                refresh_token: 'fake-refresh',
                expires_in: 3600,
                token_type: 'bearer',
              },
            },
          },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: {
            success: false,
            error: 'Credenciales inválidas',
          },
        });
      }
    }).as('loginUser');
  });

  it('Debe permitir autenticación exitosa', () => {
    cy.visit('/auth');
    cy.get('#login-email').type('juanperez@test.com');
    cy.get('#login-password').type('12345678');
    cy.get('button[type="submit"]').click();

  cy.wait('@loginUser').its('request.body').should('include', { email: 'juanperez@test.com' });
  cy.url().should('include', '/dashboard');
    
  });

  it('Debe mostrar error con credenciales incorrectas', () => {
    cy.visit('/auth');
    cy.get('#login-email').type('usuario@falso.com');
    cy.get('#login-password').type('error123');
    cy.get('button[type="submit"]').click();

  cy.wait('@loginUser').its('request.body').should('include', { email: 'usuario@falso.com' });
    // Puede aparecer el mensaje del backend o el mensaje genérico del UI
    cy.contains(/(Credenciales inválidas|Error al iniciar sesión\. Verifica tus credenciales\.)/)
      .should('be.visible');
    // No debe redirigir al dashboard
    cy.url().should('include', '/auth');
  });
});
