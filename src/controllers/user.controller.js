import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user details
  //validate fields (required fields present, etc)
  //check if user already exists
  //check if avatar req field present
  //upload images to cloudinary, avatar
  //create user object- create entry in db
  //remove password and refrestoken field from user
  //check for user creation
  //return user response

  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some((fld) => fld?.trim() === "")) {
    throw new ApiError(400, "Required field(s) are empty");
  }

  const userExists = await User.findOne({ $or: [{ username }, { email }] });
  console.log(userExists);
  if (userExists) {
    throw new ApiError(400, "User already exists.");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;

  if (req.files && Array.isArray(req.files.coverImage) &&  req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required.");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(409, "CLOUDINARY: Avatar file is required.");
  }

  const user = await User.create({
    avatar: avatar.url,
    email,
    password,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase(),
    fullName,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user.");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered succesfully."));
});

export { registerUser };
