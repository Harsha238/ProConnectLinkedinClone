import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import path from "path";
import ConnectionRequest from "../models/connections.model.js";


const convertUserDataTOPDF = async (userData) => {

  return new Promise((resolve, reject) => {

    if (!userData || !userData.userId) {
      return reject(new Error("Invalid user data"));
    }

    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";
    const filePath = path.join("uploads", outputPath);

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    const imagePath = path.join("uploads", userData.userId.profilePicture || "");

    if (fs.existsSync(imagePath)) {
      try {
        doc.image(imagePath, 250, 50, { width: 100 });
      } catch (err) {
        console.log("Invalid image format");
      }
    }

    doc.y = 180;

    doc.fontSize(20).text("Profile Resume", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(14).text(`Name: ${userData.userId.name}`);
    doc.text(`Username: ${userData.userId.username}`);
    doc.text(`Email: ${userData.userId.email}`);
    doc.text(`Bio: ${userData.bio || ""}`);
    doc.text(`Current Position: ${userData.currentPost || ""}`);

    doc.moveDown();

    // ✅ FIXED PART (IMPORTANT)
    doc.fontSize(16).text("Past Work");
    doc.moveDown(0.5);

    const workData = userData.pastWork || userData.postWork;

    if (workData && workData.length > 0) {
      workData.forEach((work) => {
        doc.fontSize(14).text(`Company: ${work.company || work.companyName}`);
        doc.text(`Position: ${work.position}`);
        doc.text(`Years: ${work.years}`);
        doc.moveDown();
      });
    } else {
      doc.fontSize(12).text("No past work available");
      doc.moveDown();
    }

    doc.moveDown();

    // EDUCATION
    doc.fontSize(16).text("Education");
    doc.moveDown(0.5);

    if (userData.education && userData.education.length > 0) {
      userData.education.forEach((edu) => {
        doc.fontSize(14).text(`School: ${edu.school}`);
        doc.text(`Degree: ${edu.degree}`);
        doc.text(`Field: ${edu.fieldOfStudy}`);
        doc.moveDown();
      });
    } else {
      doc.fontSize(12).text("No education details available");
    }

    doc.end();

    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);

  });
};


export const register = async (req, res) => {

  try {

    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });

    if (user)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username
    });

    await newUser.save();

    const profile = new Profile({
      userId: newUser._id
    });

    await profile.save();

    res.json({ message: "User Created" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};


export const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne(
      { _id: user._id },
      { token }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};


export const getUserProfile = async (req, res) => {

  try {

    const { token } = req.query;

    const user = await User.findOne({ token });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const profile = await Profile
      .findOne({ userId: user._id })
      .populate("userId", "name username email profilePicture");

    res.json({ profile });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

export const userUpdate = async (req, res) => {
  try {
    const { token, name } = req.body;

    const user = await User.findOne({ token });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.name = name;
    await user.save();

    res.json({ message: "User Updated" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateProfileData = async (req, res) => {

  try {

    const { token, ...profileData } = req.body;

    const user = await User.findOne({ token });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const profile = await Profile.findOne({ userId: user._id });

    // Fix field mismatch
if (profileData.postWork) {
  profileData.pastWork = profileData.postWork;
}

// Assign data
Object.assign(profile, profileData);

    await profile.save();

    res.json({ message: "Profile Updated" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};


export const getAllUserProfile = async (req, res) => {

  try {

    const profiles = await Profile
      .find()
      .populate("userId", "name username email profilePicture");

    res.json({ profiles });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};


export const sendConnectionRequest = async (req, res) => {
  

  const { token, connectionId } = req.body;
  console.log("TOKEN:", token);
console.log("CONNECTION ID:", connectionId);

  try {

    const user = await User.findOne({ token });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const existing = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId
    });

    if (existing)
      return res.status(400).json({ message: "Request already sent" });

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId
    });

    await request.save();

    res.json({ message: "Request sent" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};


export const getMyConnectionsRequest = async (req, res) => {
  

  const { token } = req.body;
  console.log("TOKEN RECEIVED:", token);

  try {

    const user = await User.findOne({ token });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const connections = await ConnectionRequest
  .find({
    $or: [
      { connectionId: user._id },
      { userId: user._id }
    ]
  })
  .populate("userId", "name username email profilePicture")
  .populate("connectionId", "name username email profilePicture");

    res.json({ connections });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};


export const acceptConnectionRequest = async (req, res) => {

  const { token, requestId, action_type } = req.body;

  try {

    const user = await User.findOne({ token });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const request = await ConnectionRequest.findOne({ _id:requestId });

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    request.status_accepted = action_type === "accept";

    await request.save();

    res.json({ message: "Request updated" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};


export const commentPost = async (req, res) => {

  const { token, post_id, commentBody } = req.body;

  try {

    const user = await User.findOne({ token });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const post = await Post.findById(post_id);

    if (!post)
      return res.status(404).json({ message: "Post not found" });

    const comment = new Comment({
      userId: user._id,
      postId: post._id,
      body: commentBody
    });

    await comment.save();

    res.json({ message: "Comment added" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};


export const getUserProfileAndUserBasedOnUsername = async (req, res) => {

  const { username } = req.query;

  try {

    const user = await User.findOne({ username });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const profile = await Profile
      .findOne({ userId: user._id })
      .populate("userId", "name username email profilePicture");

    res.json({ profile });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

export const downloadProfile = async (req, res) => {
  try {

    const user_id = req.query.id;

    const userProfile = await Profile.findOne({ userId: user_id })
      .populate("userId", "name username email profilePicture");

    if (!userProfile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    const outputPath = await convertUserDataTOPDF(userProfile);

    return res.download(`uploads/${outputPath}`);

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });

  }
};

export const uploadProfilePicture = async (req, res) => {

  try {

    const { token } = req.body;

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    user.profilePicture = req.file.filename;

    await user.save();

    return res.json({
      message: "Profile picture updated",
      profilePicture: req.file.filename
    });

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });

  }

};

export const whatAreMyConnections = async (req, res) => {

  const { token } = req.body;

  try {

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const connections = await ConnectionRequest
      .find({ connectionId: user._id })
      .populate("userId", "name username email profilePicture");

    return res.json({ connections });

  } catch (error) {

    return res.status(500).json({
      message: error.message
    });

  }

};