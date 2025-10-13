describe('Inicio de sesión en Salud Vital', () => {
  beforeEach(() => {
    // Mock de Edge Function login (URL exacta de Supabase)
    cy.intercept('POST', 'https://fbstreidlkukbaqtlpon.supabase.co/functions/v1/login', (req) => {
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

    cy.wait('@loginUser');
    cy.url().should('include', '/dashboard');
    cy.contains('Bienvenido').should('be.visible');
  });

  it('Debe mostrar error con credenciales incorrectas', () => {
    cy.visit('/auth');
    cy.get('#login-email').type('usuario@falso.com');
    cy.get('#login-password').type('error123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginUser');
    cy.contains('Credenciales inválidas').should('be.visible');
  });
});
