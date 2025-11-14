import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import { initializeRoutes } from "./route.config.js";
import errorHandler from "../middlewares/errorHandle.middleware.js";
import { getSwaggerSpecs, swaggerUi } from "./swagger.config.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

const setupServer = async () => {
  const specs = getSwaggerSpecs();
  
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "E-Learning Platform API Docs",
    })
  );

  const router = await initializeRoutes();
  app.use("/api", router);

  app.use(errorHandler);

  return http.createServer(app);
};

export default setupServer;
