import { BsFillChatTextFill } from "react-icons/bs";
import "./TabSwitch.scss";

const TabSwitch = ({ name, text, iconPath, currentTab }) => {
  //#region Render
  return (
    <div
      className={
        currentTab === name ? "tab-switch tab-switch--active" : "tab-switch"
      }
    >
      <span className={"icon-with-text"}>
        {iconPath ? (
          <img
            className={"icon-with-text__icon"}
            src={iconPath}
            alt={"tab icon"}
          />
        ) : (
          <span className={"icon-with-text__icon"}>
            <BsFillChatTextFill />
          </span>
        )}

        <span className={"icon-with-text__text"}>{text}</span>
      </span>
    </div>
  );
  //#endregion
};

export default TabSwitch;
