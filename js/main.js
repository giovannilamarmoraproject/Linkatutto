const SPLITTER = "_";
const DEFAULT_STYLE_CSS =
  "align-items: cover; background-repeat: no-repeat; background-color: #323232;";

const version = "V1.0.0";

const urlConfig = {
  /** Local Config */
  baseUrl: "http://localhost:8080",
  client_id: "client_id=LINKATUTTO-AUTH-TEST",
  redirect_uri: "redirect_uri=http://localhost:5501/index.html",
  /** Remote Config */
  //baseUrl: "https://access.sphere.service.stg.giovannilamarmora.com",
  //client_id: "client_id=LINKATUTTO-AUTH-01",
  //redirect_uri: "redirect_uri=https://linkatutto.giovannilamarmora.com",
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
};

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const access_token = urlParams.get("access-token");
  const session_id = urlParams.get("session-id");

  if (code) {
    // Chiama l'endpoint /token per scambiare il codice con un token
    exchangeCodeForToken(code);
  } else {
    if (access_token) {
      if (session_id) localStorage.setItem("Session-ID", session_id);
      localStorage.setItem("access-token", access_token);
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState(null, "", cleanUrl);
    }
    authorizeToken(); // Se il codice non è presente, richiama authorizeToken
  }
});

function exchangeCodeForToken(code) {
  const urlParams = new URLSearchParams(window.location.search);
  const scope = urlParams.get("scope");
  const tokenUrl =
    urlConfig.baseUrl +
    urlConfig.token +
    urlConfig.param +
    urlConfig.client_id +
    urlConfig.divider +
    "code=" +
    code +
    urlConfig.divider +
    urlConfig.redirect_uri +
    urlConfig.divider +
    urlConfig.grant_type +
    urlConfig.divider +
    "scope=" +
    scope;

  const cleanUrl = window.location.origin + window.location.pathname;
  window.history.replaceState(null, "", cleanUrl);

  fetch(tokenUrl, {
    method: "POST",
    //mode: "no-cors", // Disabilita il controllo CORS (ma la risposta sarà "opaque")
    headers: {
      "Content-Type": "application/json",
      ...getSavedHeaders(),
    },
    credentials: "same-origin",
  })
    .then((response) => {
      fetchHeader(response.headers);
      return response.json();
    })
    .then((data) => {
      if (data.data) {
        // Salva il token nel cookie o nel local storage
        if (data.data.token.access_token)
          localStorage.setItem("access-token", data.data.token.access_token);
        if (data.data.strapiToken.access_token)
          localStorage.setItem(
            "strapi-token",
            data.data.strapiToken.access_token
          );

        // Ora puoi chiamare getDatas() o fare altre operazioni
        getDatas();
      } else {
        localStorage.clear();
        console.error("Token exchange failed", data);
      }
    })
    .catch((error) => {
      //localStorage.clear();
      localStorage.setItem("errorMessage", error.toString() + " " + url);
      window.location.href = window.location.origin + "/forbidden.html";
    });
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function authorizeToken() {
  const token =
    getCookie("access-token") != null
      ? getCookie("access-token")
      : localStorage.getItem("access-token");
  const url =
    urlConfig.baseUrl +
    urlConfig.authorize +
    urlConfig.param +
    urlConfig.client_id +
    urlConfig.divider +
    urlConfig.access_type +
    urlConfig.divider +
    urlConfig.redirect_uri +
    urlConfig.divider +
    urlConfig.scope +
    urlConfig.divider +
    urlConfig.response_type;

  fetch(url, {
    method: "GET",
    headers: token
      ? { Authorization: `Bearer ${token}`, ...getSavedHeaders() }
      : {
          Authorization: null,
        },
    redirect: "follow",
    mode: "cors", // no-cors, *cors, same-origin
    //credentials: "include",
  })
    .then((response) => {
      fetchHeader(response.headers);
      if (response.ok) {
        const redirectUrl = response.headers.get("Location")
          ? response.headers.get("Location")
          : response.url != url
          ? response.url
          : null;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      } else if (!response.ok) {
        localStorage.clear();
        console.error("Authorization check failed.");
      }
      if (getCookie("strapi-token")) {
        localStorage.setItem("access-token", getCookie("access-token"));
        localStorage.setItem("strapi-token", getCookie("strapi-token"));
        getDatas();
      }
      return response.json();
    })
    .then((response) => {
      if (response.data.strapiToken.access_token) {
        localStorage.setItem(
          "strapi-token",
          response.data.strapiToken.access_token
        );
      }
      getDatas();
    })
    .catch((error) => {
      localStorage.setItem("errorMessage", error.toString() + " " + url);
      //window.location.href = window.location.origin + "/forbidden.html";
    });
}

function logout() {
  const token =
    getCookie("access-token") != null
      ? getCookie("access-token")
      : localStorage.getItem("access-token");
  const logoutUrl =
    urlConfig.baseUrl +
    urlConfig.logout +
    urlConfig.param +
    urlConfig.client_id;

  fetch(logoutUrl, {
    method: "POST",
    //mode: "no-cors", // Disabilita il controllo CORS (ma la risposta sarà "opaque")
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...getSavedHeaders(),
    },
    credentials: "same-origin",
  })
    .then((response) => {
      fetchHeader(response.headers);
      return response.json();
    })
    .finally((res) => {
      localStorage.clear();
      location.reload();
    })
    .catch((error) => {
      //localStorage.clear();
      localStorage.setItem("errorMessage", error.toString() + " " + url);
      window.location.href = window.location.origin + "/forbidden.html";
    });
}

function fetchHeader(headers) {
  // Leggi gli header specifici che ti interessano
  const parentId = headers.get("Parent-ID");
  const redirectUri = headers.get("redirect-uri");
  const sessionId = headers.get("Session-ID");
  const spanId = headers.get("Span-ID");
  const traceId = headers.get("Trace-ID");

  // Salva gli header in localStorage o sessionStorage
  if (parentId) localStorage.setItem("Parent-ID", parentId);
  if (redirectUri) localStorage.setItem("redirect-uri", redirectUri);
  if (sessionId) localStorage.setItem("Session-ID", sessionId);
  if (spanId) localStorage.setItem("Span-ID", spanId);
  if (traceId) localStorage.setItem("Trace-ID", traceId);
}

function getSavedHeaders() {
  const headers = {};

  const parentId = localStorage.getItem("Parent-ID");
  const redirectUri = localStorage.getItem("redirect-uri");
  const sessionId = localStorage.getItem("Session-ID");
  const spanId = localStorage.getItem("Span-ID");
  const traceId = localStorage.getItem("Trace-ID");

  if (parentId) headers["Parent-ID"] = parentId;
  if (redirectUri) headers["redirect-uri"] = redirectUri;
  if (sessionId) headers["Session-ID"] = sessionId;
  if (spanId) headers["Span-ID"] = spanId;
  if (traceId) headers["Trace-ID"] = traceId;

  return headers;
}

function getDatas() {
  getStrapiData(
    "https://strapi.giovannilamarmora.com/api/hostwebservers?populate=*"
  ).then((data) => {
    if (data.error != null) {
      localStorage.clear();
      return;
    }
    displayData(mapData(data)); // JSON data parsed by `data.json()` call
    getSingleDatas();
    hideBlankPage();
    //hideLoginForm();
    animation();
  });
}

function getSingleDatas() {
  getStrapiData(
    "https://strapi.giovannilamarmora.com/api/hostwebserver-config?populate=*"
  ).then((data) => {
    if (data.error != null) {
      localStorage.clear();
      return;
    }
    displaySingleData(data);
  });
}

function hideBlankPage() {
  document.getElementById("blank_page").classList.add("not-display-login");
  document.getElementById("dashboard").classList.remove("not-display");
}

function hideLoginForm() {
  document.getElementById("loginForm").classList.add("not-display-login");
  document.getElementById("dashboard").classList.remove("not-display");
}

/*function doLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  let encode = btoa(username + ":" + password);

  const body = { identifier: username, password: password };
  postStrapiData(
    "https://strapi.giovannilamarmora.com/api/auth/local",
    body
  ).then((data) => {
    if (data.error != null)
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Invalid credentials!",
      });
    else {
      localStorage.setItem("strapi-token", data.jwt);
      getDatas();
    }
  });
}*/

function mapData(inputData) {
  const mappedData = {};

  inputData.data.forEach((item) => {
    const category = item.attributes.category;

    if (!mappedData[category]) {
      mappedData[category] = [];
    }

    const mappedItem = {
      title: item.attributes.title,
      logo:
        item.attributes.logo.data != null
          ? "https://strapi.giovannilamarmora.com" +
            item.attributes.logo.data.attributes.url
          : null,
      link: {},
      style_css:
        item.attributes.style_css == null
          ? DEFAULT_STYLE_CSS
          : item.attributes.style_css.replaceAll("\n", " "),
    };

    if (item.attributes.url) {
      for (const [key, value] of Object.entries(item.attributes.url)) {
        mappedItem.link[key] = value;
      }
    }

    mappedData[category].push(mappedItem);
  });

  return mappedData;
}

function displaySingleData(strapi) {
  let strapiData = strapi.data.attributes;
  $(".logo-images").attr("src", strapiData.logo);
  $(".github_url").attr("href", strapiData.github_url);
  $(".log_explore").attr("href", strapiData.log_explore);
  $(".website_url").attr("href", strapiData.website_url);
  $("#copyright-text").text(strapiData.copyright + ". " + version);
  $("#contact_url").attr("href", strapiData.contact_url);
  $("#about_url").attr("href", strapiData.about_url);
  $("#FAQ_url").attr("href", strapiData.FAQ_url);
  $("#support_url").attr("href", strapiData.support_url);
}

function displayData(strapi) {
  const dataList = document.getElementById("dataList");
  dataList.innerHTML = ""; // Pulisce eventuali dati precedenti
  for (const key in strapi) {
    if (strapi.hasOwnProperty(key)) {
      //dataList.innerHTML += `<li><strong>${key}:</strong> ${data[key]}</li>`;
      dataList.innerHTML +=
        `<section class="features section">
    <div class="container">
      <div class="features-inner section-inner has-bottom-divider"> ${
        key == "Default" ? "" : "<h1 class='text-center'>" + key + "</h1>"
      }

        <div class="features-wrap">` + createCard(strapi[key]);
      +`
        </div>
      </div>
    </div>
  </section>`;
    }
  }
}
/*
align-items: cover;
              background-repeat: no-repeat;
              background-color: #323232;
              */
function createCard(datas) {
  let res = "";
  datas.forEach((element) => {
    res +=
      `<div class="feature text-center is-revealing">
    <div class="feature-inner">
      <div align="center" class="row">
        <div class="card mx-auto">
          <div
            class="card-side front"
            style="
              background-image: url(${element.logo});
              ${
                element.style_css == null
                  ? DEFAULT_STYLE_CSS
                  : element.style_css
              }
            "
          ></div>
          <div class="card-side back">
            <div class="">
              <h4
                class="text-center text-white fw-bolder text-uppercase"
              >
              ${element.title}
              </h4>
              <hr />` +
      createButton(element.link) +
      `</div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  });
  return res;
}

function createButton(datas) {
  const keys = Object.keys(datas);
  let res = `<div ${
    keys.length > 3
      ? "style='display: inline-grid; grid-template-columns: auto auto; margin-left: -15px;'"
      : "align='center'"
  }>`;
  for (const key in datas) {
    if (datas.hasOwnProperty(key)) {
      //dataList.innerHTML += `<li><strong>${key}:</strong> ${data[key]}</li>`;
      res += `<a
          href="${datas[key]}"
          target="_blank"
          class="btn btn-primary rounded-pill mb-2"
          style="
            min-width: 150px;
            height: 50px;
            padding-top: auto;
          "
          >${key}</a
        >`;
    }
  }
  res += "</div>";
  return res;
}
