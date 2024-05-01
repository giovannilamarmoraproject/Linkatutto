const SPLITTER = "_";
const DEFAULT_STYLE_CSS =
  "align-items: cover; background-repeat: no-repeat; background-color: #323232;";

$(document).ready(function () {
  getDatas();
});

function getDatas() {
  getStrapiData(
    "https://strapi.hostwebserver.site/api/hostwebservers?populate=*"
  ).then((data) => {
    if (data.error != null) {
      localStorage.clear();
      //return location.reload();
      return;
    }
    displayData(mapData(data)); // JSON data parsed by `data.json()` call
    getSingleDatas();
    hideLoginForm();
    animation();
  });
}

function getSingleDatas() {
  getStrapiData(
    "https://strapi.hostwebserver.site/api/hostwebserver-config?populate=*"
  ).then((data) => {
    if (data.error != null) {
      localStorage.clear();
      //return location.reload();
      return;
    }
    displaySingleData(data);
  });
}

function hideLoginForm() {
  document.getElementById("loginForm").classList.add("not-display-login");
  //document.getElementById('loginForm').classList.add("not-display");
  document.getElementById("dashboard").classList.remove("not-display");
  //animation();
  //$(".is-revealing").css("opacity", "");
}

function doLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  let encode = btoa(username + ":" + password);

  const body = { identifier: username, password: password };
  postStrapiData("https://strapi.hostwebserver.site/api/auth/local", body).then(
    (data) => {
      if (data.error != null)
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Invalid credentials!",
        });
      else {
        localStorage.setItem("access-token", data.jwt);
        getDatas();
      }
    }
  );
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
          ? "https://strapi.hostwebserver.site" +
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
  $("#copyright-text").text(strapiData.copyright);
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
