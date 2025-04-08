(async function initialize() {
  // Assicurati che loadConfig sia già definito globalmente
  //const urlConfig = await loadConfig();
  let urlConfig = await configuration;
  if (!urlConfig) urlConfig = await loadConfig();
  console.log("✅ Configuration loaded:", urlConfig);

  const DEFAULT_STYLE_CSS =
    "align-items: cover; background-repeat: no-repeat; background-color: #323232;";

  const version = "V2.0.1";

  /**
   * ------------------------------
   * Access Sphere Authorize
   * ------------------------------
   */
  document.addEventListener("ACCESS_SPHERE_AUTH", (event) => {
    const { success, data, error } = event.detail;
    if (success && !error) {
      getDatas();
    } else {
      localStorage.setItem("errorMessage", error.error.message);
      window.location.href = window.location.origin + "/forbidden.html";
    }
  });

  /**
   * ------------------------------
   * Access Sphere Token
   * ------------------------------
   */
  document.addEventListener("ACCESS_SPHERE_TOKEN", (event) => {
    const { success, data, error } = event.detail;
    if (success && !error) {
      getDatas();
    } else {
      localStorage.setItem("errorMessage", error.error.message);
      window.location.href = window.location.origin + "/forbidden.html";
    }
  });

  /**
   * ------------------------------
   * Strapi Get Data
   * ------------------------------
   */
  function getDatas() {
    const token = localStorage.getItem(urlConfig.client_id + "_strapi-token");
    getStrapiData(urlConfig.strapi_url + urlConfig.linkatutto_datas, token)
      .then((data) => {
        if (data.error != null) {
          localStorage.clear();
          localStorage.setItem("errorMessage", error.toString());
          window.location.href = window.location.origin + "/forbidden.html";
          return;
        }
        displayData(mapData(data)); // JSON data parsed by `data.json()` call
        getSingleDatas();
        hideBlankPage();
        //hideLoginForm();
        animation();
      })
      .catch((error) => {
        //localStorage.clear();
        localStorage.setItem("errorMessage", error.toString());
        window.location.href = window.location.origin + "/forbidden.html";
      });
  }

  function getSingleDatas() {
    const token = localStorage.getItem(urlConfig.client_id + "_strapi-token");
    getStrapiData(urlConfig.strapi_url + urlConfig.linkatutto_data, token)
      .then((data) => {
        if (data.error != null) {
          localStorage.clear();
          localStorage.setItem("errorMessage", error.toString());
          window.location.href = window.location.origin + "/forbidden.html";
          return;
        }
        displaySingleData(data);
      })
      .catch((error) => {
        //localStorage.clear();
        localStorage.setItem("errorMessage", error.toString());
        window.location.href = window.location.origin + "/forbidden.html";
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
            ? urlConfig.strapi_url + item.attributes.logo.data.attributes.url
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
})();

/**
 * ------------------------------
 * Logout Process
 * ------------------------------
 */
function logout() {
  console.log("🔴 Logout started...");
  window.AccessSphere.logout();
}
