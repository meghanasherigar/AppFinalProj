export const environment = {
  name: 'DEV',
  projectSetupApiUrl: 'https://ddigitaldoxmicroservies.deloitteonline.com',
  userManagementApiUrl: 'https://ddigitaldoxmicroservies.deloitteonline.com',
  projectManagementApiUrl: 'https://ddigitaldoxmicroservies.deloitteonline.com',
  projectDesignApiUrl: 'http://localhost:55503',

  useAAALogIn: true, 

  // Auth Endpoints
  authEndpoints:
  {
    authority:'https://dforge-idsrv-intus.azurewebsites.net/idsrv',
    scope : 'openid tipid tipdd taxtip',
    clientId: 'tip-digital-dox3-spa',
    redirectURI: 'http://localhost:4200/auth',
    postLogoutRedirectURI: 'http://localhost:4200/logout',
    responseType: 'id_token token',
    silentRedirectURI: 'http://localhost:4200/assets/silent-renew.html',
  },
  userProfileAPIUrl:'https://dforge-aaapi-intus.azurewebsites.net/aa//api/v1/self/profile',
};
