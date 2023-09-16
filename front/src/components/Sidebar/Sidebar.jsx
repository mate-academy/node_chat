import React, { useContext } from "react";
import { AppContext } from "../../context/appContext";
import { textService } from "../../services/textService";
import RoomsBlock from "../RoomsBlock/RoomsBlock";
import TabSwitch from "../TabSwitch/TabSwitch";
import "./Sidebar.scss";

const Sidebar = ({
  addClasses = "",
  tabsNames = {},
  currentTab = "profile",
  setCurrentTab = () => {},
}) => {
  //#region Get user from app context
  const { user } = useContext(AppContext);
  //#endregion

  //#region Render
  return (
    <div className={`sidebar ${addClasses}`}>
      <div className={"avatar-with-text sidebar__avatar-with-text"}>
        <div className={"avatar-outside-container"}>
          {user?.photoUrl ? (
            <img src={user?.photoUrl} alt={"Avatar"} className={"avatar"} />
          ) : (
            <div className={"avatar avatar-anonym"}></div>
          )}
        </div>

        <div className={"text-container"}>
          <div className={"text-container__name"}>
            {`${user?.fullName || "not defined"} `}
          </div>
          <div className={"text-container__id"}>
            {`ID: ${textService.truncateString(user?.id, 4)}`}
          </div>
        </div>
      </div>

      <div className="sidebar__tabs-switches">
        <div
          className={"sidebar__tab-item"}
          onClick={() => setCurrentTab(tabsNames.profile)}
        >
          <TabSwitch
            name={tabsNames.profile}
            text={"My profile"}
            iconPath={"assets/images/person-icon.svg"}
            currentTab={currentTab}
          />
        </div>

        {user?.id && (
          <div
            className={"sidebar__tab-item"}
            onClick={() => setCurrentTab(tabsNames.chat)}
          >
            <TabSwitch
              name={tabsNames.chat}
              text={"Chats"}
              iconPath={"assets/images/chat-icon.svg"}
              currentTab={currentTab}
            />
          </div>
        )}
      </div>

      {currentTab === tabsNames.chat && <RoomsBlock />}
    </div>
  );
  //#endregion
};

export default Sidebar;
