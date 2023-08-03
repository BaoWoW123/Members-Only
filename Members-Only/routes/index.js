var express = require("express");
var router = express.Router();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { User, Post } = require("../db");
const { check, validationResult } = require("express-validator");

/* GET home page. */
router.get("/", async function (req, res, next) {
  const postArr = await Post.find().sort({date:-1});
  res.render("index", { user: req.user, posts: postArr });
});

router.get("/signup", (req, res) => res.render("signup"));
router.get("/post", (req, res) => res.render("post", { user: req.user }));
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.post(
  "/signup",
  [
    check("password", "Password must be at least 5 characters long")
      .trim()
      .isLength({ min: 5 })
      .escape(),
    check("username", "Username must be 5-20 characters")
      .trim()
      .isLength({ min: 5, max: 20 })
      .escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.render("signup", { errors: errors.array() });
    let usernameTaken = await User.findOne({ username: req.body.username });
    if (usernameTaken)
      return res.render("signup", { errors: [{ msg: "Username taken" }] });
    if (req.body.password !== req.body.confirmPassword)
      return res.render("signup", {
        errors: [{ msg: "Passwords do not match" }],
      });
    try {
      bcrypt.hash(req.body.password, 10, async (err, hashedPw) => {
        if (err) return next(err);
        const user = new User({
          username: req.body.username,
          password: hashedPw,
        });
        const save = await user.save();
        const postArr = await Post.find().sort({date:-1});
        res.render("index", { user: req.user, posts: postArr });
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

router.post(
  "/post",
  [
    check("title", "Title must be 1 to 50 characters")
      .trim()
      .isLength({ min: 1, max: 50 })
      .escape(),
    check("content", "Content must be 5 to 500 characters")
      .trim()
      .isLength({ min: 5, max: 500 })
      .escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.render("post", { user: req.user, errors: errors.array() });
    try {
      const post = new Post({
        user: req.user.username,
        title: req.body.title,
        content: req.body.content,
        date: new Date(),
      });
      const save = await post.save();
      const postArr = await Post.find().sort({date:-1});
      res.render("index", { user: req.user, posts: postArr });
    } catch (err) {
        //change error format to display in view correctly
      res.render("post", { errors: err });
    }
  }
);

module.exports = router;
