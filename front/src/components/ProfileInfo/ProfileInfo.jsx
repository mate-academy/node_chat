import React, { useEffect, useContext, useState } from "react";
import { AppContext } from "../../context/appContext";
import { textService } from "../../services/textService.js";
import { userService } from "../../services/userService";
import Loader from "../Loader/Loader";
import { notificationService } from "../../services/notificationService";
import "./ProfileInfo.scss";

const ProfileInfo = ({ addClasses = "" }) => {
  //#region Get user from context
  const { user, setUser } = useContext(AppContext);
  //#endregion

  //#region Loader
  const [isLoading, setIsLoading] = useState(false);
  //#endregion

  //#region Set and update userAccount data
  const [userAccountData, setUserAccountData] = useState({});

  useEffect(() => {
    setUserAccountData(user);
  }, [user]);

  function updateAccountData(fieldName, newValue) {
    setUserAccountData((data) => ({
      ...data,
      [fieldName]: newValue,
    }));
  }
  //#endregion

  //#region Save profile in DB
  const saveUser = async (userData) => {
    try {
      setIsLoading(true);
      const { fullName } = userData;

      const userFromDb = await userService.createUser(fullName);

      setUser(userFromDb);
      localStorage.setItem("chatUser", JSON.stringify(userFromDb));
      notificationService.showSuccess("User has been added");
    } catch (error) {
      notificationService.showError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  //#endregion

  //#region Render
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={`profile-info ${addClasses}`}>
          <div className={"avatar-with-text profile-info__avatar-with-text"}>
            <div
              className={
                "avatar-outside-container profile-info__avatar-outside-container"
              }
            >
              {user?.photoUrl ? (
                <img
                  src={user?.photoUrl}
                  alt={"Avatar"}
                  className={"profile-info__avatar"}
                />
              ) : (
                <div className={"profile-info__avatar-anonym"}></div>
              )}
            </div>

            <div className={"text-container profile-info__text-container"}>
              <div className={"text-container__name profile-info__name"}>
                {`${user?.fullName || "not defined"} `}
              </div>
              <div className={"text-container__id profile-info__id"}>
                {`ID: ${textService.truncateString(user?.id, 18)}`}
              </div>
            </div>
          </div>

          <div className={"profile-info__data profile-data"}>
            <div className={"profile-data__item"}>
              <div className={"profile-data__input-title"}>
                <span>{user?.id ? "Username" : "Enter your name"}</span>
              </div>

              <input
                type={"text"}
                className={"regular-form-control profile-data__input"}
                placeholder="Enter your name"
                value={userAccountData?.fullName || ""}
                onChange={(event) =>
                  updateAccountData("fullName", event.target.value)
                }
                disabled={user?.id}
              />
            </div>
          </div>

          {!user?.id && (
            <div className={"profile-info__data profile-data"}>
              <button
                type={"button"}
                className={"regular-button"}
                onClick={() => saveUser(userAccountData)}
              >
                Save username
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
  //#endregion
};

export default ProfileInfo;
