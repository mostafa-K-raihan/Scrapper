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

function getAxiosOptions() {
  return {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36 Edg/103.0.1264.49",
    },
  };
}

async function fetchDailyStar(param) {
  const axiosOption = getAxiosOptions();
  const { data: html } = await axios.get(`https://www.thedailystar.net`, axiosOption);
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

  console.log('Fetched urls');
  const urls = titles.map(t => t.url);

  const htmls = await Promise.all(urls.map(u => {
    return axios.get(u, axiosOption)
  }));
  console.log('Fetched all contents');

  const contents = htmls.map((h, index) => {
    const $ = cheerio.load(h.data);

    return $("div.section-content").text().trim();
  });

  titles.forEach((t, index) => {
    t.content = contents[index];
  });

  console.log(contents);
  console.log('Parsing Done');
  // console.log(titles);
  return titles;
}

function getBimanBangladeshURL(origin, dest) {
  const today = new Date();
  const activeMonth = `${
    today.getMonth() + 1
  }-${today.getDate()}-${today.getFullYear()}`;
  const baseURL = "https://booking.biman-airlines.com/dx/BGDX/#/date-selection";
  const url = `${baseURL}?journeyType=one-way&origin=${origin}&destination=${dest}&activeMonth=${activeMonth}`;
  
  return url;
}


async function searchBimanBangladeshFlights(origin, dest) {
  console.log(`Searching for flights from ${origin} to ${dest}`);
  const url = getBimanBangladeshURL(origin, dest);
  console.log({ url });

  const { data: html } = await axios.get(url, getAxiosOptions());
  console.log(html);
}

async function searchFlights(origin, dest) {
  console.log(`searching for flights to ${origin} -> ${dest}`);
  const url = getBimanBangladeshURL(origin, dest);
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
  searchBimanBangladeshFlights,
};
