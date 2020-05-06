const playwright = require("playwright-aws-lambda");

exports.handler = async function (event, ctx) {
  const browser = await playwright.launchChromium();
  const context = await browser.newContext();
  const page = await context.newPage();

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
