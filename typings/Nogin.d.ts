declare var Nogin: {
  disableXSRF: boolean,
  postLoginRedirectPath: string,
  signupAgreement?: string,
  Routes: import('../app/server/routeUtils.js').Routes,
  _: import('intl-dom').I18NCallback<string|Element>,
  redirect: (key: string) => void
};

declare var NoginInitialErrorGlobal: string;
