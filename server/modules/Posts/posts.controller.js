const catchAsyncError = require("../../middleware/catchAsyncError");
const Post = require("./posts.model");

exports.createPost = catchAsyncError(async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(422).json({ error: "Please add all fields" });
  }
  req.user.password = undefined;
  const post = new Post({
    title,
    body,
    postedBy: req.user,
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Return password with all other data which is not good practice

// exports.allPosts = catchAsyncError(async (req, res) => {
//   Post.find().populate('postedBy')
//     .then((posts) => {
//       res.status(200).json({ posts });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

// ------------------ ALL POSTS ---------------------------

// Return only _id, name and email >>>>>>>>>>

exports.allPosts = catchAsyncError(async (req, res) => {
  Post.find()
    .populate("postedBy", "_id name email")
    .then((posts) => {
      res.status(200).json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

// Aggregation Pipeline with user as an array

// exports.allPosts = catchAsyncError(async (req, res) => {
//     Post.aggregate([
//       {
//         $lookup: {
//           from: "users", // name of the users collection
//           localField: "postedBy", // field in the current collection to join on
//           foreignField: "_id", // field in the other collection to join on
//           as: "user", // output array field
//         },
//       },
//       {
//         $project: {
//           __v: 0, // exclude the __v field from the output
//           "user.password": 0,
//           "user.__v": 0 // exclude the password field from the output
//         },
//       },
//     ])
//       .then((posts) => {
//         res.status(200).json({ posts });
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   });

// Aggregation Pipeline with user key as an object

// exports.allPosts = catchAsyncError(async (req, res) => {
//     Post.aggregate([
//       {
//         $lookup: {
//           from: "users", // name of the users collection
//           localField: "postedBy", // field in the current collection to join on
//           foreignField: "_id", // field in the other collection to join on
//           as: "user", // output array field
//         },
//       },
//       {
//         $addFields: {
//           user: { $arrayElemAt: ["$user", 0] } // get the first element of the user array
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           title: 1,
//           body: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           user: {
//             _id: 1,
//             name: 1,
//             email: 1
//           }
//         },
//       },
//     ])
//       .then((posts) => {
//         res.status(200).json({ posts });
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   });

// --------------------------- GET USER's OWN POST -----------------------

exports.authPosts = catchAsyncError(async (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name email")
    .then((posts) => {
      res.status(200).json({ data: posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

exports.likePosts = catchAsyncError(async (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

exports.unLikePosts = catchAsyncError(async (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

exports.commentPosts = catchAsyncError(async (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id, name")
    .then((result) => {
      return res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

exports.deletePost = catchAsyncError(async (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate("postedBy", "id")
    .then((post) => {
      if (!post) {
        return res.status(422).json({ message: "No post found" });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .deleteOne()
          .then((result) => {
            return res.status(200).json(result);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
