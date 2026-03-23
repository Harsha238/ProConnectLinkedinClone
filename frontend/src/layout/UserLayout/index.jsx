import NavBarComponent from "@/Components/Navbar";
import React from "react";

function UserLayout({ children }) {
  return (
    <div className="appWrapper">  
      <NavBarComponent />
      {children}
    </div>
  );
}

export default UserLayout;