import { toast } from "react-toastify";

const notificationObject = {
  position: "top-center",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

function showError(notification) {
  (() => toast.error(notification, notificationObject))();
}

function showSuccess(notification) {
  (() => toast.success(notification, notificationObject))();
}

export const notificationService = { showError, showSuccess };
