import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Token");
    }
};

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend/Postman
    // validation - not empty
    // check if user already exists: email
    // check for image, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {username, email, password} = req.body;
    
    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All field is required");
    }

    const existedUser = await User.findOne({email});

    if(existedUser){
        throw new ApiError(409, "Email is already registered");
    }

    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar field is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is Missing")
    }

    const user = await User.create({
        username,
        avatar: avatar.url,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

});

const loginUser = asyncHandler(async (req, res)=>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, password} = req.body;

    if(!email && !password){
        throw new ApiError(400, "Email and password is required")
    }

    const profile = await User.findOne({email});

    if(!profile){
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await profile.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid Credentials")
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(profile._id);

    const loggedInUser = await User.findById(profile._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json(
        new ApiResponse(
            201,
            {
                profile: loggedInUser,
                accessToken,
                refreshToken
            },
            "User Successfully Logged in"
        )
       )
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
       .clearCookie("accessToken", options)
       .clearCookie("refreshToken", options)
       .json(new ApiResponse(201, {}, "User Logged Out"))

});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshhToken = req.cookies?.refreshToken || req.body.refreshToken ;

    if(!incomingRefreshhToken){
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshhToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        if(!user){
            throw new ApiError(404, "User Not Found")
        }

        if(incomingRefreshhToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
                  .cookie("accessToken", accessToken, options)
                  .cookie("refreshToken", refreshToken, options)
                  .json(new ApiResponse(
                    201,
                    {
                        accessToken,
                        refreshToken
                    },
                    "Access Token Refreshed"
                  ))
        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
});



export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken

 }