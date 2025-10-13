import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // URL base de tu aplicación (puedes cambiarla según el entorno)
    baseUrl: "http://localhost:8080",

    // Tiempo máximo de espera para comandos (en ms)
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 60000,

    // Carpeta donde están tus tests end-to-end
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",

    // Habilita capturas y videos de las pruebas (útil para informes)
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    video: true,

    // Configuración de eventos de Node (plugins, reporter, etc.)
    setupNodeEvents(on, config) {
      // Aquí puedes agregar hooks, reporters o configuración avanzada
      // Ejemplo: integración con mochawesome o Allure
      return config;
    },
  },

  // Configuración adicional de reporter (opcional)
  reporter: "spec",

  // Opcional: controla los logs y vistas en la consola
  viewportWidth: 1280,
  viewportHeight: 800,
  chromeWebSecurity: false, // útil para apps SPA locales
});
