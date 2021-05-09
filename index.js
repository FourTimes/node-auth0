const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const request = require("request");
const helmet = require("helmet");
var jwt = require("express-jwt");
var jwks = require("jwks-rsa");

app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));
app.use(cors());
app.use(helmet());

const route_item_purchase = require("./routes/route_item_purchase");
const route_item_sales = require("./routes/route_item_sales");
const route_item_details = require("./routes/route_item_details");
const route_item_uploads = require("./routes/route_item_uploads");

app.use("/public", express.static(__dirname + "/public"));
app.use("/uploads", express.static(__dirname + "/uploads"));

var jwtConfig = {
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://jino.auth0.com/.well-known/jwks.json",
  }),
  audience: "https://node-js",
  issuer: "https://jino.auth0.com/",
  algorithms: ["RS256"],
};

var jwtCheck = jwt(jwtConfig);

app.use(jwtCheck);

app.get("/", (req, res) => res.send("supermarket application designed"));
app.use("/item_purchase", route_item_purchase);
app.use("/item_sales", route_item_sales);
app.use("/item_details", route_item_details);
app.use("/item_uploads", route_item_uploads);

app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(403).send({
      success: false,
      message: "No token provided.",
    });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
