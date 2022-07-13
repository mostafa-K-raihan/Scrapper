const axios = require("axios");
const cheerio = require("cheerio");

// async function fetchDevTo(param) {
//   const { data: html } = await axios.get(`https://dev.to`, {
//     headers: {
//       "user-agent":
//         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36 Edg/103.0.1264.49",
//     },
//   });
//   const $ = cheerio.load(html);
//   const titles = [];
//   $("h2.crayons-story__title > a").each(function () {
//     const x = $(this);
//     titles.push({
//       title: x.text().trim(),
//       url: x.attr("href"),
//     });
//   });

//   return titles;
// }

async function fetchDailyStar(param) {
  const { data: html } = await axios.get(`https://www.thedailystar.net`, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36 Edg/103.0.1264.49",
    },
  });
  const $ = cheerio.load(html);
  const titles = [];
  $("h3.title").each(function () {
    const url = $("a", this).attr("href");
    const classNames = $(this).attr("class");
    const title = $(this).text().trim();
    const prefix = classNames.includes("font-bn")
      ? ""
      : "https://www.thedailystar.net";

    titles.push({
      title,
      url: `${prefix}${url}`,
    });
  });

  return titles;
}

module.exports = {
  fetch: fetchDailyStar,
};
