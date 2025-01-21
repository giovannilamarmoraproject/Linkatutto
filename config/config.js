const localConfig = {
  baseUrl: "http://localhost:8081",
  client_id: "client_id=LINKATUTTO-AUTH-TEST",
  redirect_uri: "redirect_uri=http://localhost:5501/index.html",
  authorize: "/v1/oAuth/2.0/authorize",
  token: "/v1/oAuth/2.0/token",
  logout: "/v1/oAuth/2.0/logout",
  param: "?",
  divider: "&",
  access_type: "access_type=online",
  scope: "scope=openid",
  login_type_bearer: "type=bearer",
  login_type_google: "type=google",
  response_type: "response_type=code",
  grant_type: "grant_type=authorization_code",
  strapi_url: "https://strapi.giovannilamarmora.com",
  linkatutto_datas: "/api/hostwebservers?populate=*&pagination[pageSize]=100",
  linkatutto_data: "/api/hostwebserver-config?populate=*",
};

const fallbackConfig = {
  baseUrl: "https://access.sphere.service.stg.giovannilamarmora.com",
  client_id: "client_id=LINKATUTTO-AUTH-01",
  redirect_uri: "redirect_uri=https://linkatutto.giovannilamarmora.com",
  authorize: "/v1/oAuth/2.0/authorize",
  token: "/v1/oAuth/2.0/token",
  logout: "/v1/oAuth/2.0/logout",
  param: "?",
  divider: "&",
  access_type: "access_type=online",
  scope: "scope=openid",
  login_type_bearer: "type=bearer",
  login_type_google: "type=google",
  response_type: "response_type=code",
  grant_type: "grant_type=authorization_code",
  strapi_url: "https://strapi.giovannilamarmora.com",
  linkatutto_datas: "/api/hostwebservers?populate=*&pagination[pageSize]=100",
  linkatutto_data: "/api/hostwebserver-config?populate=*",
};

async function loadConfig() {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isLocal) {
    console.log("Using local configuration");
    return localConfig;
  }

  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/giovannilamarmoraproject/Linkatutto/refs/heads/master/config/config.jsonc"
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch remote config: ${response.statusText}`);
    }

    const jsoncText = await response.text();

    // Rimuovi i commenti dal JSONC
    const jsonText = jsoncText.replace(
      /("(?:\\.|[^"\\])*")|\/\/.*|\/\*[\s\S]*?\*\//g,
      (match, group1) => group1 || ""
    );

    const remoteConfig = JSON.parse(jsonText);

    console.log("Using remote configuration from GitHub");
    return remoteConfig;
  } catch (error) {
    console.error(
      "Failed to load remote configuration. Using fallback config.",
      error
    );
    return localConfig;
  }
}
