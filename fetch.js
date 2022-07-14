const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

async function fetchDevTo(param) {
  const { data: html } = await axios.get(`https://dev.to`, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36 Edg/103.0.1264.49",
    },
  });
  const $ = cheerio.load(html);
  const titles = [];
  $("h2.crayons-story__title > a").each(function () {
    const x = $(this);
    titles.push({
      title: x.text().trim(),
      url: x.attr("href"),
    });
  });

  return titles;
}

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

async function searchFlights(origin, dest) {
  console.log(`searching for flights to ${origin} -> ${dest}`);
  const today = new Date();
  const activeMonth = `${
    today.getMonth() + 1
  }-${today.getDate()}-${today.getFullYear()}`;
  const baseURL = "https://booking.biman-airlines.com/dx/BGDX/#/date-selection";
  const url = `${baseURL}?journeyType=one-way&origin=${origin}&destination=${dest}&activeMonth=${activeMonth}`;
  async function run() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector("#dxp-calendar-load-next-month");
    const prices = await page.evaluate(() => {
      const prices = Array.from(document.querySelectorAll(".price"))
        .map((x) => {
          const dateCell = x.closest(".dxp-date-selection-day");

          if (dateCell.id) {
            const dateCellString = dateCell.id.split("-")[1];
            return {
              price: x.innerText,
              date: `${dateCellString.slice(0, 4)}/${dateCellString.slice(
                4,
                6
              )}/${dateCellString.slice(6)}`,
            };
          }

          return null;
        })
        .filter(Boolean);

      return prices;
    });
    browser.close();

    return prices;
  }
  return await run();
}

module.exports = {
  fetchDevTo,
  fetchDailyStar,
  searchFlights,
};
