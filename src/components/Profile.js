import React from "react";
import "./Profile.css";

const Profile = () => {
  const auth = localStorage.getItem("user");
  const user = {
    photo: "https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png", 
    name: JSON.parse(auth).user.name,
    email: JSON.parse(auth).user.email
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img src={user.photo} alt="Profile" className="profile-photo" />
        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-email">{user.email}</p>
      </div>
    </div>
  );
};

export default Profile;
