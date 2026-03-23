/*steps
-submit action
-handle action in its reducer
-register here->reducer 
*/

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import postReducer from "./reducer/postReducer";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    postReducer: postReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false
    })
});

