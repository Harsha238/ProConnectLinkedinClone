import { Router } from "express";

import {
  register,
  login,
  uploadProfilePicture,
  getUserProfile,
  updateProfileData,
  getAllUserProfile,
  downloadProfile,
  sendConnectionRequest,
  getMyConnectionsRequest,
  whatAreMyConnections,
  acceptConnectionRequest,
  getUserProfileAndUserBasedOnUsername,
  userUpdate
} from "../controllers/user.controller.js";

import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage:storage });

router.post("/update_profile_picture", upload.single("profile_picture"), uploadProfilePicture);
router.get("/get_user_and_profile", getUserProfile);
router.get("/user/get_all_users", getAllUserProfile);
router.post("/update_profile_data", updateProfileData);
router.post("/register", register);
router.post("/login", login);
router.post("/user_update", userUpdate);
router.get("/user/download_resume", downloadProfile);
router.post("/user/send_connection_request", sendConnectionRequest);
router.post("/user/getConnectionRequests", getMyConnectionsRequest);
router.post("/user/user_connection_request", whatAreMyConnections);
router.post("/user/accept_connection_request", acceptConnectionRequest);
router.get("/user/get_profile_based_on_username", getUserProfileAndUserBasedOnUsername);

export default router;