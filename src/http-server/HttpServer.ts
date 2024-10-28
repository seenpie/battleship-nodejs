import { Server, createServer } from "http";

import path from "path";
import fs from "fs";

export class HttpServer {
  private server: Server;

  constructor() {
    this.server = this._initServer();
  }

  private _initServer(): Server {
    return createServer((req, res) => {
      const __dirname = path.resolve(path.dirname(""));
      const file_path =
        __dirname +
        (req.url === "/" ? "/front/index.html" : "/front" + req.url);
      fs.readFile(file_path, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
        res.writeHead(200);
        res.end(data);
      });
    });
  }

  public start(port: string | number) {
    console.log(`Start static http server on the ${port} port!`);
    this.server.listen(port);
  }
}
