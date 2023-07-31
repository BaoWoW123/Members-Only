var express = require("express");
var router = express.Router();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../db");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { user: req.user });
});

router.get("/signup", (req, res) => res.render("signup"));
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.post("/signup", async (req, res) => {
  let usernameTaken = await User.findOne({ username: req.body.username });
  if (usernameTaken) return res.render("signup", { errors: "Username taken" });
  try {
    bcrypt.hash(req.body.password, 10, async (err, hashedPw) => {
      if (err) return next(err);
      const user = new User({
        username: req.body.username,
        password: hashedPw,
      });
      const save = await user.save();
      res.render("index");
    });
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

module.exports = router;
