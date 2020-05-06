// Dependencies
const playwright = require("playwright-aws-lambda");
const fs = require("fs");

// Script
const script = fs.readFileSync("./image.js", "utf-8");

exports.handler = async function (event, ctx) {
  const browser = await playwright.launchChromium();
  const context = await browser._defaultContext;
  const page = await context.newPage();

  page.setViewportSize({
    width: 1200,
    height: 630,
  });

  await page.setContent(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div id="app">
          <div>Holaaaaa</div>
        </div>
      </body>
    </html>
  `);

  const {
    queryStringParameters: { tags: tagsParam, title, author },
  } = event;
  const tags = tagsParam ? decodeURIComponent(tagsParam).split(",") : [];
  await page.addScriptTag({
    content: `
      window.title = "${title || "No Title"}";
      window.tags = ${JSON.stringify(tags)};
      window.author = "${decodeURIComponent(author) || ""}";
    `,
  });
  await page.addScriptTag({ content: script });

  const boundingReact = await page.evaluate(() => {
    const app = document.getElementById("app");
    const { x, y, width, height } = app.children[0].getBoundingClientRect();

    return { x, y, width, height };
  });

  const screenshotBuffer = await page.screenshot({ clip: boundingReact });

  await browser.close();

  return {
    isBase64Encoded: true,
    statusCode: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Length": screenshotBuffer.length.toString(),
    },
    body: screenshotBuffer.toString("base64"),
  };
};
