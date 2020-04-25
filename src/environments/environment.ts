export const environment = {
  name: 'LOCAL',
  projectSetupApiUrl: 'https://qdigitaldoxmicroservies.deloitteonline.com',
  userManagementApiUrl: 'https://qdigitaldoxmicroservies.deloitteonline.com/usermanagement',
  projectManagementApiUrl: 'https://qdigitaldoxmicroservies.deloitteonline.com/projectmanagement',
  projectDesignApiUrl: 'http://localhost:53391',
  useAAALogIn: true,

  // Auth Endpoints
authEndpoints:
  {
    authority:'https://dforge-idsrv-intus.azurewebsites.net/idsrv',
    scope : 'openid profile email tipcc tipid tipdd taxtip',
    clientId: 'tip-digital-dox3-spa',
    redirectURI: 'http://localhost:4200/auth',
    postLogoutRedirectURI: 'http://localhost:4200/logout',
    responseType: 'id_token token',
    silentRedirectURI: 'http://localhost:4200/assets/silent-renew.html',
  },
  userProfileAPIUrl: 'https://dforge-aaapi-intus.azurewebsites.net/aa//api/v1/self/profile',
};


