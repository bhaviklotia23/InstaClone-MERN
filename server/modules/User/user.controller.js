const catchAsyncError = require("../../middleware/catchAsyncError");
const User = require("./user.model");
const Post = require("../Posts/posts.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.registerUser = catchAsyncError(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(422).json({ error: "Please add all the fields" });
  }

  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({ error: "User already exists" });
      }
      bcrypt.hash(password, 12).then((hashedpass) => {
        const user = new User({
          email,
          password: hashedpass,
          name,
        });
        user
          .save()
          .then((user) => {
            return res.status(201).json({ message: "User saved successfully" });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

exports.loginUser = catchAsyncError(async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ error: "Please add email or password" });
  }

  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ message: "Invalid Email or Password" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          const token = jwt.sign(
            { _id: savedUser._id },
            process.env.JWT_SECRET
          );
          return res.status(200).json({ token });

          //   return res.status(200).json({ message: "Successfully Logged In" });
        } else {
          return res.status(422).json({ message: "Invalid Email or Password" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

exports.getUserById = catchAsyncError(async (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-password")
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate("postedBy", "id name email")
        .then((posts) => {
          return res.status(200).json({ data: posts });
        }).catch((err)=>{
          console.log(err)
        });
    })
    .catch((err) => {
      return res.status(404).json({ message: "User not found" });
    });
});
