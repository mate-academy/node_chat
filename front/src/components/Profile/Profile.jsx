import React, { useContext, useState } from "react";
import { AppContext } from "../../context/appContext";
import ProfileInfo from "../../components/ProfileInfo/ProfileInfo";
import ClientChat from "../../components/ClientChat/ClientChat";
import Sidebar from "../Sidebar/Sidebar";
import NoRoom from "../NoRoom/NoRoom";
import "./Profile.scss";

const Profile = () => {
  //#region Get room from app context
  const { currentRoom } = useContext(AppContext);
  //#endregion

  //#region Tabs managing
  const tabsNames = {
    profile: "profile",
    chat: "chat",
  };

  const [currentTab, setCurrentTab] = useState(tabsNames.profile);
  //#endregion

  //#region Render
  return (
    <div className="profile">
      <Sidebar
        addClasses={"profile__sidebar"}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        tabsNames={tabsNames}
      />

      <div className="profile__main">
        {currentTab === tabsNames.profile ? (
          <ProfileInfo addClasses={"profile__profile-info"} />
        ) : (
          <div className={"profile__chat"}>
            {currentRoom ? <ClientChat /> : <NoRoom />}
          </div>
        )}
      </div>
    </div>
  );
  //#endregion
};

export default Profile;
