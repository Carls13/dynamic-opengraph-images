const cloudinary = require("cloudinary").v2;
const qs = require("querystring");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

exports.handler = async function (event, ctx) {
  const { queryStringParameters } = event;

  try {
    const imageUrl = cloudinary.url(
      `${process.env.IMAGE_VERSION}/og-images/image-1.png`,
      {
        // resouce_type: "raw"
        sign_url: true,
        // secure: true,
        custom_pre_function: {
          function_type: "remote",
          source: `https://opengraph.netlify.app/.netlify/functions/generate-opengraph?${qs.stringify(
            queryStringParameters
          )}`,
        },
      }
    );

    console.log(imageUrl);

    return {
      statusCode: 302,
      headers: {
        Location: imageUrl,
      },
      body: "",
    };
  } catch (e) {
    console.log(e);
  }
};
