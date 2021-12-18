require("dotenv").config();

export let config = {
  serviceName: process.env.SERVICE_NAME || "WHITEBOARD_AUTH0_TENANT",
  mongodbURI:
    process.env.MONGO_DB_URI || "mongodb://localhost:27017/whiteboard",
  port: process.env.PORT || 8100,
};
