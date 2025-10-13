describe('Registro de usuario en Salud Vital', () => {
  beforeEach(() => {
    // Mock de Edge Function register
    cy.intercept('POST', '**/functions/v1/register', (req) => {
      const { email, full_name } = req.body;
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          data: {
            user: {
              id: 'u_2',
              email,
              full_name: full_name || 'Juan Pérez',
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
    }).as('registerUser');
  });

  it('Debería permitir que un usuario se registre correctamente', () => {
    cy.visit('/auth');

    // Abrir la pestaña de Registro
    cy.contains('button', 'Registrarse').click();

    // Completa los campos del formulario (ids reales del componente)
    cy.get('#register-name').type('Juan Pérez');
    cy.get('#register-email').type('juanperez@test.com');
    cy.get('#register-password').type('12345678');

    // Envía el formulario
    cy.get('button[type="submit"]').click();

    // Espera la respuesta de la API mock
    cy.wait('@registerUser');

    // Verifica redirección y mensaje en dashboard
    cy.url().should('include', '/dashboard');
  });
});
