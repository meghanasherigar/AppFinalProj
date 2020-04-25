export const environment = {
  name: 'PROD',
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
    redirectURI: 'https://ddigitaldox.deloitteonline.com/auth',
    postLogoutRedirectURI: 'https://ddigitaldox.deloitteonline.com/logout',
    responseType: 'id_token token',
    silentRedirectURI: 'https://ddigitaldox.deloitteonline.com/assets/silent-renew.html',
  },
  userProfileAPIUrl:'https://dforge-aaapi-intus.azurewebsites.net/aa//api/v1/self/profile',
};
