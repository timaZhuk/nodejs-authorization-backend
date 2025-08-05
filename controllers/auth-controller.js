const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//---SIGNUP register controller
const registerUser = async (req, res) => {
  try {
    //get username, email, password, role from request body(from frontend)
    const { username, email, password, role } = req.body;

    //check if user exist by username or email
    const checkExistingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (checkExistingUser) {
      res.status(400).json({
        success: false,
        message:
          "User is already exists. Check out whether email or username are unique",
      });
      return;
    }

    //hash password before save in DB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create a new user and save in your database
    const newlyCreateUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newlyCreateUser.save();

    //send response with user object
    if (newlyCreateUser) {
      res.status(201).json({
        success: true,
        message: "User registered OK",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Unable to register user",
      });
    }

    //------------------------------
  } catch (error) {
    console.log("Error in registerUser controller: ", error);
    res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
};

//---- LOGIN login controller
const loginUser = async (req, res) => {
  try {
    //get username and hashed_password from request body
    const { username, password } = req.body;

    //find if the current user in DB or not

    const user = await User.findOne({ username });

    //check if user exists
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password",
      });
    }
    //compare hasPassword in DB with input password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password, try again",
      });
    }
    // creating user token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "30m",
      }
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfull",
      accessToken,
    });

    //----------------------------------
  } catch (error) {
    console.log("Error in loginUser controller: ", error);
    res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
};

//---- change Password functionality-----
const changePassword = async (req, res) => {
  //--------------------------------------
  try {
    // ---- for authorized user only possible to change password
    const userId = req.userInfo.userId;
    // ----extract old and new password
    const { oldPassword, newPassword } = req.body;

    //find the current logged in user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    //check if the old password is correct
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        messege: "old password is not correct! Enter correct password again",
      });
    }

    //hash the new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    //update user password
    user.password = newHashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });

    //-------------------------
  } catch (error) {
    console.log("Error in loginUser controller: ", error);
    res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
};

//--------------------------------
module.exports = {
  loginUser,
  registerUser,
  changePassword,
};
