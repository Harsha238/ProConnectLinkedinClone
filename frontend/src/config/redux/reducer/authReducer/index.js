import { createSlice } from "@reduxjs/toolkit";
import { getAboutUser, getAllUsers, getConnectionsRequest, getMyConnectionsRequest, loginUser, registerUser } from "../../action/authAction";
import { actionAsyncStorage } from "next/dist/server/app-render/action-async-storage.external";

const initialState = {
  user: undefined,
  isError: false,
  isSuccess: false,
  isLoading: false,
  loggedIn: false,
  message: "",
  isTokenThere:false,
  profileFetched: false,
  connections: [],
  connectionRequest: [],
  allUsers: [],
  all_profiles_fetched:false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: () => initialState,

    handleLoginUser: (state) => {
      state.message = "hello";
    },
    emptyMessage:(state)=>{
      state.message=""
    },
    setTokenIsThere: (state) => {
      state.isTokenThere = true;
    },
    setTokenIsNotThere: (state) => {
      state.isTokenThere = false;
      
    }
  },

  // ⚠️ extraReducers must be OUTSIDE reducers
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.message = "knocking the door...";
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = true;
        state.message = "Login is Successful";
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.message = "Registering you...";
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = true;
        state.loggedIn = false;
        state.message = "Registration is Successful.Please login in";
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAboutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.profileFetched = true;
        state.user = action.payload.profile;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.all_profiles_fetched = true;
        state.allUsers = action.payload.profiles;
      })
      .addCase(getConnectionsRequest.fulfilled, (state, action) => {
        state.connections=action.payload
      })
      .addCase(getConnectionsRequest.rejected, (state, action) => {
        state.message=action.payload
      })
      .addCase(getMyConnectionsRequest.fulfilled, (state, action) => {
        state.connectionRequest=action.payload
      })
      .addCase(getMyConnectionsRequest.rejected, (state, action) => {
        state.message=action.payload
      })
  }
});

export const { reset, handleLoginUser,emptyMessage,setTokenIsThere,setTokenIsNotThere } = authSlice.actions;

export default authSlice.reducer;