import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

// LOGIN USER
export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {

      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        return response.data.token;
      }

      return thunkAPI.rejectWithValue({
        message: "Token not provided"
      });

    } catch (error) {

      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Login failed" }
      );

    }
  }
);

// REGISTER USER
export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {

      const response = await clientServer.post("/register", {
        username: user.username,
        name: user.name,
        email: user.email,
        password: user.password
      });

      return response.data;

    } catch (error) {

      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Registration failed" }
      );

    }
  }
);

// GET USER PROFILE
export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (token, thunkAPI) => {
    try {

      const response = await clientServer.get("/get_user_and_profile", {
        params: { token }
      });

      return response.data;

    } catch (error) {

      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Failed to fetch user" }
      );

    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_all_users");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (user, thunkAPI) => {
    try {

      const response = await clientServer.post(
        "/user/send_connection_request",
        {
          token: user.token,
          connectionId: user.connectionId
        }
      );

      thunkAPI.dispatch(getConnectionsRequest({token:user.token}))

      return thunkAPI.fulfillWithValue(response.data);

    } catch (error) {

      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Request failed" }
      );

    }
  }
);

export const getConnectionsRequest = createAsyncThunk(
  "user/getMyConnections",
  async (user, thunkAPI) => {
    try {

      const response = await clientServer.post(
        "/user/getConnectionRequests",
        {
          token: user.token
        }
      );

      return thunkAPI.fulfillWithValue(response.data.connections);

    } catch (error) {

      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Failed to fetch connections" }
      );

    }
  }
);

export const getMyConnectionsRequest = createAsyncThunk(
  "user/getMyConnectionsRequest",
  async (user, thunkAPI) => {
    try {

      const response = await clientServer.post(
        "/user/user_connection_request", 
        {
          token: user.token
        }
    );

      return thunkAPI.fulfillWithValue(response.data.connections);

    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Failed to fetch requests" }
      );
    }
  }
);

export const AcceptConnection = createAsyncThunk(
  "user/acceptConnection",
  async (user, thunkAPI) => {
    try {

      const response = await clientServer.post(
  "/user/accept_connection_request",
  {
    token: user.token,
    requestId: user.requestId,  // this should be request _id
    action_type: user.action
  }
      );
      thunkAPI.dispatch(getConnectionsRequest({ token: user.token }))
      thunkAPI.dispatch(getMyConnectionsRequest({token:user.token}))

      return thunkAPI.fulfillWithValue(response.data);

    } catch (error) {

      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Action failed" }
      );

    }
  }
);

export * from "../authAction";