import express, { Express, Request, Response } from "express";
import dotenv, { config } from "dotenv";
import aiRouter from "./routers/ai.router";
import expoTemplateRouter from "./routers/expoTemplate.router";

declare global {
  namespace Express {
    interface Request {
      username?: string;
    }
  }
}
dotenv.config();
const app: Express = express();
var cors = require("cors");
app.use(cors());
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.get("/api/v0.1/health", async (req: Request, res: Response) => {
  res.status(200).json("Pong!");
});
app.use("/api/v0.1/ai", aiRouter);
app.use("/api/v0.1", expoTemplateRouter);
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
