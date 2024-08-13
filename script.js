var criteriaLog = {};

function modifyCriteria(type, isAdding) {
  var inputField = document.getElementById(type);
  var value = inputField.value.trim().toLowerCase().replace(/\s+/g, "-");
  if (value) {
    var action = isAdding ? "+" : "+-";
    var formattedValue =
      type === "search" ? `${action}"${value}"` : `${action}${type}:"${value}"`;
    criteriaLog[type] = criteriaLog[type] || [];
    criteriaLog[type].push(formattedValue);
    updateLogDisplay(type);
    inputField.value = "";
  }
}

function updateLogDisplay(type) {
  var logSpan = document.getElementById(type + "Log");
  logSpan.innerHTML = "";
  criteriaLog[type].forEach(function (item) {
    var span = document.createElement("span");
    span.textContent = item + " ";
    span.className = item.startsWith("+-") ? "removed" : "added";
    logSpan.appendChild(span);
  });
}

function addRandomTag() {
  fetch("/tag.json")
    .then((response) => response.json())
    .then((tags) => {
      const existingTags = criteriaLog.tag
        ? criteriaLog.tag.map((item) =>
            item.split(":")[1].replace(/["+-]/g, "")
          )
        : [];
      let filteredTags = tags.filter((tag) => !existingTags.includes(tag));
      if (filteredTags.length === 0) {
        return alert("No more tags available to add.");
      }
      let randomTag =
        filteredTags[Math.floor(Math.random() * filteredTags.length)];
      document.getElementById("tag").value = randomTag;
      modifyCriteria("tag", true);
    })
    .catch((error) => {
      console.error("Error loading tags:", error);
    });
}

function generateLink() {
  var baseUrl = "https://nhentai.net/search/?q=";
  var queryParts = [];

  Object.keys(criteriaLog).forEach(function (type) {
    criteriaLog[type].forEach(function (item) {
      queryParts.push(item);
    });
  });

  var language = document.getElementById("language").value;
  if (language) {
    queryParts.push(`+language:${language}`);
  }

  if (document.getElementById("translated").checked) {
    queryParts.push(`+language:translated`);
  }

  var minPages = document.getElementById("minPages").value;
  var maxPages = document.getElementById("maxPages").value;
  if (minPages) queryParts.push(`+pages:>=${minPages}`);
  if (maxPages) queryParts.push(`+pages:<=${maxPages}`);

  var uploadedBefore = document.getElementById("uploadedBefore").value;
  var uploadedAfter = document.getElementById("uploadedAfter").value;
  if (uploadedAfter) {
    var afterDate = new Date(uploadedAfter);
    var today = new Date();
    var diff = Math.floor((today - afterDate) / (1000 * 60 * 60));
    queryParts.push(`+uploaded:<=${diff}h`);
  }
  if (uploadedBefore) {
    var beforeDate = new Date(uploadedBefore);
    var today = new Date();
    var diff = Math.floor((today - beforeDate) / (1000 * 60 * 60));
    if (diff > 24) {
      queryParts.push(`+uploaded:>=${diff}h`);
    }
  }

  // Add category to queryParts if selected
  var category = document.getElementById("category").value;
  if (category) {
    queryParts.push(`+category:${category}`);
  }

  var generatedLinkElement = document.getElementById("generatedLink");

  if (queryParts.join("").trim() === "") {
    generatedLinkElement.href = "https://nhentai.net/";
    generatedLinkElement.textContent = "https://nhentai.net/";
  } else {
    var sort = document.getElementById("sort").value;
    if (sort && sort !== "recent") {
      queryParts.push(`&sort=${sort}`);
    }

    var finalQuery = queryParts.join("").trim();
    generatedLinkElement.href = baseUrl + finalQuery;
    generatedLinkElement.textContent = baseUrl + finalQuery;
  }
}

function copyLink() {
  const linkText = document.getElementById("generatedLink").textContent;
  navigator.clipboard.writeText(linkText).then(
    () => {
      alert("Link copied to clipboard!");
    },
    (err) => {
      console.error("Could not copy text: ", err);
    }
  );
}

function resetCriteria() {
  criteriaLog = {};
  document
    .querySelectorAll("input[type=text], input[type=number], input[type=date]")
    .forEach(function (input) {
      input.value = "";
    });
  document
    .querySelectorAll("input[type=checkbox]")
    .forEach(function (checkbox) {
      checkbox.checked = false;
    });
  document.getElementById("sort").value = "recent";
  document.getElementById("language").value = "";
  document.getElementById("category").value = "";
  document.querySelectorAll('span[id$="Log"]').forEach(function (span) {
    span.innerHTML = "";
  });
  document.getElementById("generatedLink").textContent = "";
}

function loadSuggestions() {
  const fields = ["parody", "character", "tag", "artist", "group"];
  fields.forEach((field) => {
    fetch(`/${field}.json`)
      .then((response) => response.json())
      .then((data) => {
        const dataList = document.getElementById(field + "List");
        data.forEach((item) => {
          const option = document.createElement("option");
          option.value = item;
          dataList.appendChild(option);
        });
      })
      .catch((error) => console.error(`Error loading ${field}.json:`, error));
  });
}

document.addEventListener("DOMContentLoaded", loadSuggestions);
